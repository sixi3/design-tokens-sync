import React, { useState, useEffect } from 'react';
import { 
  designSystemTracker, 
  updatePrimaryColor, 
  updateSecondaryColor, 
  updateSpacing,
  validateDesignSystem,
  logDesignSystemStatus 
} from '../../utils/design-system-sync';
import { DESIGN_SYSTEM_THEME } from '../../utils/design-system';
import { 
  createFigmaSync, 
  generateFigmaTokensFile, 
  generateFigmaVariables,
  generateTokensStudioFormat 
} from '../../utils/figma-sync';
import { tokensLoader, useTokens } from '../../utils/tokens-loader';

interface DesignSystemManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tokens Studio Tab Component
const TokensStudioTab: React.FC = () => {
  const { tokens, loading, error, refresh } = useTokens();
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<any>(null);

  const handleRefresh = async () => {
    await refresh();
  };

  const handleCompare = async () => {
    setComparing(true);
    try {
      const comp = await tokensLoader.compareWithDesignSystem();
      setComparison(comp);
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-medium text-red-800 mb-2">❌ Error Loading Tokens</h3>
        <p className="text-red-700 text-sm mb-3">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🔗 Tokens Studio Integration</h3>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Token Status */}
      <div className={`border rounded-lg p-4 ${
        tokens?.source === 'tokens.json' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
      }`}>
        <h4 className="font-medium mb-3">📊 Token Status</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Source:</span>
            <div className="font-medium">
              {tokens?.source === 'tokens.json' ? '🔗 tokens.json (Tokens Studio)' : '📁 Design System (TypeScript)'}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Last Loaded:</span>
            <div className="font-medium text-sm">
              {tokens?.lastLoaded ? new Date(tokens.lastLoaded).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Token Summary */}
      {tokens && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(tokens.colors).length}
            </div>
            <div className="text-sm text-purple-700">Color Categories</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(tokens.spacing).length}
            </div>
            <div className="text-sm text-blue-700">Spacing Values</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">
              {Object.keys(tokens.borderRadius).length}
            </div>
            <div className="text-sm text-green-700">Border Radius</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600">
              {tokens.typography ? Object.keys(tokens.typography).length : 0}
            </div>
            <div className="text-sm text-orange-700">Typography</div>
          </div>
        </div>
      )}

      {/* Comparison Tool */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-3">🔍 Compare Sources</h4>
        <p className="text-sm text-gray-600 mb-3">
          Compare tokens.json (from Tokens Studio) with your TypeScript design system
        </p>
        <button
          onClick={handleCompare}
          disabled={comparing}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          {comparing ? '🔄 Comparing...' : '🔍 Compare'}
        </button>

        {comparison && (
          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="font-medium text-blue-800 mb-2">📊 Comparison Results</h5>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-red-600">Differences:</span>
                  <div className="text-red-700">{comparison.differences.length}</div>
                </div>
                <div>
                  <span className="font-medium text-green-600">Tokens Studio Only:</span>
                  <div className="text-green-700">{comparison.tokensJsonOnly.length}</div>
                </div>
                <div>
                  <span className="font-medium text-orange-600">Design System Only:</span>
                  <div className="text-orange-700">{comparison.designSystemOnly.length}</div>
                </div>
              </div>
            </div>

            {comparison.differences.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-medium text-red-800 mb-2">⚠️ Differences Found</h5>
                <div className="space-y-2 text-sm">
                  {comparison.differences.slice(0, 5).map((diff: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-mono text-xs">{diff.path}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600">{String(diff.designSystem)}</span>
                        <span>→</span>
                        <span className="text-green-600">{String(diff.tokensJson)}</span>
                      </div>
                    </div>
                  ))}
                  {comparison.differences.length > 5 && (
                    <p className="text-gray-600">... and {comparison.differences.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sync Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔄 Sync Workflow</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <div>
            <strong>📥 From Tokens Studio to Code:</strong>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Make changes in Tokens Studio (Figma plugin)</li>
              <li>Tokens Studio pushes to GitHub automatically</li>
              <li>Pull your repository: <code className="bg-blue-200 px-1 rounded">git pull origin main</code></li>
              <li>Click "🔄 Refresh" above to load new tokens</li>
            </ol>
          </div>
          
          <div>
            <strong>📤 From Code to Tokens Studio:</strong>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Update your design system in TypeScript</li>
              <li>Run: <code className="bg-blue-200 px-1 rounded">npm run tokens:export</code></li>
              <li>Commit and push: <code className="bg-blue-200 px-1 rounded">git add tokens.json && git commit -m "Update tokens" && git push</code></li>
              <li>Tokens Studio syncs automatically</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium mb-3">⚡ Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/tokens.json"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-center"
          >
            📄 View tokens.json
          </a>
          <button
            onClick={() => window.open('https://github.com/sixi3/eqAIDemo/blob/main/tokens.json', '_blank')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🌐 GitHub File
          </button>
        </div>
      </div>
    </div>
  );
};

export const DesignSystemManager: React.FC<DesignSystemManagerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'colors' | 'spacing' | 'history' | 'validation' | 'figma' | 'tokens'>('colors');
  const [changes, setChanges] = useState(designSystemTracker.getChangeHistory());
  const [validation, setValidation] = useState(validateDesignSystem());
  
  // Color inputs
  const [primaryColor, setPrimaryColor] = useState(DESIGN_SYSTEM_THEME.colors.primary['500']);
  const [secondaryColor, setSecondaryColor] = useState(DESIGN_SYSTEM_THEME.colors.secondary['500']);
  
  // Spacing inputs
  const [customSpacing, setCustomSpacing] = useState('');
  const [customSpacingValue, setCustomSpacingValue] = useState('');
  
  // Figma integration
  const [figmaAccessToken, setFigmaAccessToken] = useState('');
  const [figmaFileKey, setFigmaFileKey] = useState('');
  const [figmaAutoSync, setFigmaAutoSync] = useState(false);
  const [figmaSync, setFigmaSync] = useState<any>(null);
  const [figmaConnectionStatus, setFigmaConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [figmaFileInfo, setFigmaFileInfo] = useState<{ name: string; lastModified: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Refresh data when opened
      setChanges(designSystemTracker.getChangeHistory());
      setValidation(validateDesignSystem());
      
      // Load existing Figma configuration if available
      try {
        const savedConfig = localStorage.getItem('figma-config');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setFigmaAccessToken(config.accessToken || '');
          setFigmaFileKey(config.fileKey || '');
          
          // Auto-setup if we have both token and file key
          if (config.accessToken && config.fileKey) {
            setupFigmaSync().catch(console.error);
          }
        }
      } catch (error) {
        console.warn('Failed to load Figma configuration:', error);
      }
    }
  }, [isOpen]);

  const handlePrimaryColorChange = (color: string) => {
    setPrimaryColor(color);
    updatePrimaryColor(color, '500', 'Updated via Design System Manager');
    setChanges(designSystemTracker.getChangeHistory());
    setValidation(validateDesignSystem());
  };

  const handleSecondaryColorChange = (color: string) => {
    setSecondaryColor(color);
    updateSecondaryColor(color, '500', 'Updated via Design System Manager');
    setChanges(designSystemTracker.getChangeHistory());
    setValidation(validateDesignSystem());
  };

  const handleAddSpacing = () => {
    if (customSpacing && customSpacingValue) {
      updateSpacing(customSpacing, customSpacingValue, 'Added via Design System Manager');
      setCustomSpacing('');
      setCustomSpacingValue('');
      setChanges(designSystemTracker.getChangeHistory());
    }
  };

  const exportDesignSystem = () => {
    const data = designSystemTracker.exportChanges();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `design-system-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const logStatus = () => {
    logDesignSystemStatus();
  };

  // Figma integration handlers
  const setupFigmaSync = async () => {
    if (figmaAccessToken && figmaFileKey) {
      try {
        setFigmaConnectionStatus('connecting');
        
        const sync = createFigmaSync({
          accessToken: figmaAccessToken,
          fileKey: figmaFileKey,
          autoSync: figmaAutoSync,
          syncInterval: 30000
        });
        
        // Test the connection by fetching file info
        const response = await fetch(`https://api.figma.com/v1/files/${figmaFileKey}`, {
          headers: {
            'X-Figma-Token': figmaAccessToken
          }
        });
        
        if (response.ok) {
          const fileData = await response.json();
          setFigmaFileInfo({
            name: fileData.name,
            lastModified: new Date(fileData.lastModified).toLocaleString()
          });
          setFigmaSync(sync);
          setFigmaConnectionStatus('connected');
          
          // Save configuration to localStorage
          localStorage.setItem('figma-config', JSON.stringify({
            accessToken: figmaAccessToken,
            fileKey: figmaFileKey
          }));
          
          if (figmaAutoSync) {
            sync.startAutoSync();
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        setFigmaConnectionStatus('error');
        alert(`❌ Failed to connect to Figma: ${error}`);
      }
    }
  };

  const pushToFigma = async () => {
    // Check if we have write permissions
    alert(`ℹ️ Push to Figma requires "Read and write" permissions for File content. 

Your current token has "Read only" permissions, which is perfect for:
• Pulling styles from Figma to code
• Exporting design tokens
• Reading Figma file data

To push changes to Figma, you would need to:
1. Create a new token with write permissions, OR
2. Use the export feature to generate tokens that can be imported via Figma plugins

Would you like to export design tokens instead?`);
  };

  const pullFromFigma = async () => {
    if (figmaSync) {
      try {
        await figmaSync.pullFromFigma();
        alert('✅ Design system pulled from Figma successfully!');
        // Refresh data
        setChanges(designSystemTracker.getChangeHistory());
        setValidation(validateDesignSystem());
      } catch (error) {
        alert(`❌ Failed to pull from Figma: ${error}`);
      }
    }
  };

  const downloadFigmaTokens = () => {
    const tokens = generateFigmaTokensFile();
    const blob = new Blob([tokens], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'design-tokens.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadFigmaVariables = () => {
    const variables = generateFigmaVariables();
    const blob = new Blob([JSON.stringify(variables, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'figma-variables.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadTokensStudio = () => {
    const tokens = generateTokensStudioFormat();
    const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tokens-studio.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const disconnectFromFigma = () => {
    setFigmaSync(null);
    setFigmaConnectionStatus('disconnected');
    setFigmaFileInfo(null);
    setFigmaAccessToken('');
    setFigmaFileKey('');
    setFigmaAutoSync(false);
    
    // Clear saved configuration
    localStorage.removeItem('figma-config');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary-500 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">🎨 Design System Manager</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'colors', label: '🎨 Colors', icon: '🎨' },
              { id: 'spacing', label: '📏 Spacing', icon: '📏' },
              { id: 'history', label: '📜 History', icon: '📜' },
              { id: 'validation', label: '✅ Validation', icon: validation.isValid ? '✅' : '❌' },
              { id: 'figma', label: '🎨 Figma', icon: figmaConnectionStatus === 'connected' ? '✅' : figmaConnectionStatus === 'connecting' ? '🔄' : figmaConnectionStatus === 'error' ? '❌' : '🎨' },
              { id: 'tokens', label: '🔗 Tokens Studio', icon: '🔗' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'colors' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Color Configuration</h3>
              
              {/* Primary Color */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Primary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => handlePrimaryColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="#00b140"
                  />
                  <div 
                    className="w-12 h-12 rounded-lg border border-gray-300"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Secondary Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-gray-300"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => handleSecondaryColorChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="#baff29"
                  />
                  <div 
                    className="w-12 h-12 rounded-lg border border-gray-300"
                    style={{ backgroundColor: secondaryColor }}
                  />
                </div>
              </div>

              {/* Color Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: primaryColor, color: 'white' }}>
                  <h4 className="font-bold">Primary Color</h4>
                  <p className="text-sm opacity-90">Button, links, accents</p>
                </div>
                <div className="p-4 rounded-lg" style={{ backgroundColor: secondaryColor, color: 'black' }}>
                  <h4 className="font-bold">Secondary Color</h4>
                  <p className="text-sm opacity-70">Highlights, success states</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spacing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Spacing Configuration</h3>
              
              {/* Add Custom Spacing */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Add Custom Spacing</h4>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={customSpacing}
                    onChange={(e) => setCustomSpacing(e.target.value)}
                    placeholder="Key (e.g., '18')"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={customSpacingValue}
                    onChange={(e) => setCustomSpacingValue(e.target.value)}
                    placeholder="Value (e.g., '4.5rem')"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleAddSpacing}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Current Spacing Scale */}
              <div>
                <h4 className="font-medium mb-3">Current Spacing Scale</h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {Object.entries(DESIGN_SYSTEM_THEME.spacing).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <span className="font-mono">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Change History</h3>
              
              {changes.length === 0 ? (
                <p className="text-gray-500">No changes tracked yet.</p>
              ) : (
                <div className="space-y-3">
                  {changes.map((change, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{change.type}: {change.property}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(change.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-red-600">{String(change.oldValue)}</span>
                        <span className="mx-2">→</span>
                        <span className="text-green-600">{String(change.newValue)}</span>
                      </div>
                      {change.reason && (
                        <p className="text-sm text-gray-600 mt-1">{change.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Design System Validation</h3>
              
              <div className={`p-4 rounded-lg ${validation.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{validation.isValid ? '✅' : '❌'}</span>
                  <span className="font-medium">
                    {validation.isValid ? 'Design system is valid' : 'Design system has issues'}
                  </span>
                </div>
                
                {!validation.isValid && (
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                    {validation.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Design System Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">Primary Color</div>
                    <div className="text-gray-600">{DESIGN_SYSTEM_THEME.colors.primary['500']}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">Secondary Color</div>
                    <div className="text-gray-600">{DESIGN_SYSTEM_THEME.colors.secondary['500']}</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">Typography Scale</div>
                    <div className="text-gray-600">{Object.keys(DESIGN_SYSTEM_THEME.typography).length} variants</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-medium">Spacing Scale</div>
                    <div className="text-gray-600">{Object.keys(DESIGN_SYSTEM_THEME.spacing).length} values</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'figma' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Figma Integration</h3>
              
              {/* Figma Configuration */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Figma Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Token
                    </label>
                    <input
                      type="password"
                      value={figmaAccessToken}
                      onChange={(e) => setFigmaAccessToken(e.target.value)}
                      placeholder="Enter your Figma access token"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your token from Figma → Settings → Personal access tokens
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Key
                    </label>
                    <input
                      type="text"
                      value={figmaFileKey}
                      onChange={(e) => setFigmaFileKey(e.target.value)}
                      placeholder="Enter your Figma file key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Found in your Figma file URL: figma.com/file/[FILE_KEY]/...
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoSync"
                      checked={figmaAutoSync}
                      onChange={(e) => setFigmaAutoSync(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="autoSync" className="text-sm text-gray-700">
                      Enable automatic sync (every 30 seconds)
                    </label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={setupFigmaSync}
                      disabled={!figmaAccessToken || !figmaFileKey || figmaConnectionStatus === 'connecting'}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                    >
                      {figmaConnectionStatus === 'connecting' ? '🔄 Connecting...' : 'Setup Figma Sync'}
                    </button>
                    {figmaConnectionStatus === 'connected' && (
                      <button
                        onClick={disconnectFromFigma}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sync Actions */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-3">Sync Actions</h4>
                <div className="space-y-3">
                  {/* Read-only operations */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-green-800 mb-2">✅ Available with Read-only permissions</h5>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={pullFromFigma}
                        disabled={!figmaSync}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        📥 Pull from Figma
                      </button>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Import design system changes from Figma to your code
                    </p>
                  </div>
                  
                  {/* Write operations */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-orange-800 mb-2">⚠️ Requires Write permissions</h5>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={pushToFigma}
                        className="px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500"
                      >
                        📤 Push to Figma (Info)
                      </button>
                    </div>
                    <p className="text-xs text-orange-700 mt-1">
                      Click for information about push requirements
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Options */}
              <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-green-800">🚀 Recommended: Export for Figma</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={downloadFigmaTokens}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    📄 Design Tokens
                  </button>
                  <button
                    onClick={downloadFigmaVariables}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    📋 Variables
                  </button>
                  <button
                    onClick={downloadTokensStudio}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    🎨 Tokens Studio
                  </button>
                </div>
                <div className="mt-3 text-xs text-green-700 space-y-1">
                  <p><strong>Design Tokens:</strong> Generic JSON format for various Figma plugins</p>
                  <p><strong>Variables:</strong> Import directly into Figma's Variables panel (if supported)</p>
                  <p><strong>Tokens Studio:</strong> W3C format specifically for Tokens Studio plugin</p>
                  <p><strong>💡 Tip:</strong> Try Tokens Studio format first - it's the most compatible with Figma plugins</p>
                  <p><strong>📚 Need help importing?</strong> Check the <code>docs/figma-variables-import-guide.md</code> file</p>
                </div>
              </div>

              {/* Figma Integration Status */}
              <div className={`border rounded-lg p-4 ${
                figmaConnectionStatus === 'connected' ? 'border-green-200 bg-green-50' :
                figmaConnectionStatus === 'connecting' ? 'border-yellow-200 bg-yellow-50' :
                figmaConnectionStatus === 'error' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <h4 className="font-medium mb-3">Integration Status</h4>
                <div className="space-y-3">
                  {/* Connection Status with Visual Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Status:</span>
                    <div className="flex items-center space-x-2">
                      {figmaConnectionStatus === 'connected' && (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-600">✅ Connected</span>
                        </>
                      )}
                      {figmaConnectionStatus === 'connecting' && (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-yellow-600">🔄 Connecting...</span>
                        </>
                      )}
                      {figmaConnectionStatus === 'error' && (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-red-600">❌ Error</span>
                        </>
                      )}
                      {figmaConnectionStatus === 'disconnected' && (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600">⚪ Disconnected</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* File Information */}
                  {figmaFileInfo && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h5 className="text-sm font-medium text-gray-800 mb-2">📄 Connected File</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Name:</span>
                          <span className="text-xs font-medium">{figmaFileInfo.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-600">Last Modified:</span>
                          <span className="text-xs font-medium">{figmaFileInfo.lastModified}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto Sync:</span>
                    <span className={`text-sm font-medium ${figmaAutoSync ? 'text-green-600' : 'text-gray-600'}`}>
                      {figmaAutoSync ? '🔄 Enabled' : '⏸️ Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Sync:</span>
                    <span className="text-sm text-gray-600">
                      {changes.find(c => c.property === 'figma-sync')?.timestamp 
                        ? new Date(changes.find(c => c.property === 'figma-sync')!.timestamp).toLocaleString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Figma Setup Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🔧 Read-Only Workflow Guide</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <div>
                    <strong>✅ What works with Read-only permissions:</strong>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Pull design changes from Figma to your code</li>
                      <li>Export design tokens for Figma plugins</li>
                      <li>Generate Figma Variables files</li>
                      <li>Read file structure and metadata</li>
                    </ul>
                  </div>
                  
                  <div>
                    <strong>🔄 Recommended workflow:</strong>
                    <ol className="list-decimal list-inside ml-2 space-y-1">
                      <li>Designers create styles in Figma</li>
                      <li>Developers pull changes using "Pull from Figma"</li>
                      <li>Export tokens/variables for importing back to Figma</li>
                      <li>Use Figma plugins to import design tokens</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <TokensStudioTab />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={logStatus}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              📊 Log Status
            </button>
            <button
              onClick={exportDesignSystem}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              💾 Export
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {changes.length} changes tracked • {validation.isValid ? 'Valid' : 'Invalid'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemManager; 