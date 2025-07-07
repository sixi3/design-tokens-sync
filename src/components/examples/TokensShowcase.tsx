import React, { useState } from 'react';
import { useDesignTokens } from '../../utils/design-tokens';
import { motion } from 'framer-motion';

// Comprehensive showcase of how to use tokens.json throughout the project
export const TokensShowcase: React.FC = () => {
  const { tokens, loading, error, refresh } = useDesignTokens();
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design tokens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Error Loading Tokens</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="demo-button"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tokens) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No tokens available</p>
      </div>
    );
  }

  const voiceStates = ['idle', 'listening', 'processing', 'speaking'] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Design Tokens Showcase
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Demonstrating all the ways to use tokens.json in your project
          </p>
          <div className="bg-white rounded-lg p-4 inline-block shadow-sm border">
            <p className="text-sm text-gray-500">
              <strong>Source:</strong> {tokens.source} | 
              <strong> Last loaded:</strong> {new Date(tokens.lastLoaded).toLocaleString()}
            </p>
            <button
              onClick={refresh}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              🔄 Refresh Tokens
            </button>
          </div>
        </div>

        {/* Method 1: CSS Custom Properties */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">1. 🎯 CSS Custom Properties</h2>
          <p className="text-gray-600 mb-6">
            Use CSS variables directly in your styles. These are automatically generated from tokens.json.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-6 rounded-lg text-white"
              style={{ 
                backgroundColor: 'var(--color-primary-500)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-6)'
              }}
            >
              <h3 className="font-semibold mb-2">Primary Color</h3>
              <p className="text-sm opacity-90">Using var(--color-primary-500)</p>
            </div>
            
            <div 
              className="p-6 rounded-lg text-gray-900"
              style={{ 
                backgroundColor: 'var(--color-secondary-400)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-6)'
              }}
            >
              <h3 className="font-semibold mb-2">Secondary Color</h3>
              <p className="text-sm opacity-80">Using var(--color-secondary-400)</p>
            </div>
            
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: 'var(--color-neutral-50)',
                borderColor: 'var(--color-neutral-200)',
                borderRadius: 'var(--border-radius-lg)',
                padding: 'var(--spacing-6)'
              }}
            >
              <h3 className="font-semibold mb-2">Neutral Color</h3>
              <p className="text-sm text-gray-600">Using var(--color-neutral-50)</p>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h4 className="font-medium mb-2">CSS Example:</h4>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`.my-component {
  background: var(--color-primary-500);
  padding: var(--spacing-6);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-duration-normal) ease-out;
}`}
            </pre>
          </div>
        </section>

        {/* Method 2: Utility Classes */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">2. 🛠️ Utility Classes</h2>
          <p className="text-gray-600 mb-6">
            Pre-built CSS classes that use your design tokens.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Color Utilities</h3>
              <div className="space-y-2">
                <div className="p-3 rounded bg-primary text-white">
                  .bg-primary (from tokens)
                </div>
                <div className="p-3 rounded bg-secondary text-gray-900">
                  .bg-secondary (from tokens)
                </div>
                <div className="p-3 rounded border text-primary">
                  .text-primary (from tokens)
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Spacing & Layout</h3>
              <div className="space-y-2">
                <div className="p-token-4 bg-gray-100 rounded-token-md">
                  .p-token-4 .rounded-token-md
                </div>
                <div className="m-token-4 p-token-4 bg-gray-100 rounded-token-lg">
                  .m-token-4 .p-token-4 .rounded-token-lg
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Method 3: React Hook */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">3. ⚛️ React Hook (useDesignTokens)</h2>
          <p className="text-gray-600 mb-6">
            Access tokens directly in your React components with full TypeScript support.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(tokens.colors).slice(0, 4).map(([category, shades]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium capitalize">{category}</h4>
                <div className="space-y-1">
                  {Object.entries(shades).slice(0, 3).map(([shade, color]) => (
                    <div key={shade} className="flex items-center space-x-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs font-mono">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h4 className="font-medium mb-2">React Example:</h4>
            <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`import { useDesignTokens } from '../utils/design-tokens';

function MyComponent() {
  const { tokens } = useDesignTokens();
  
  return (
    <div style={{
      backgroundColor: tokens?.colors.primary?.['500'],
      padding: tokens?.spacing?.['6'],
      borderRadius: tokens?.borderRadius?.lg
    }}>
      Using design tokens!
    </div>
  );
}`}
            </pre>
          </div>
        </section>

        {/* Method 4: Voice Components (Following Cursor Rules) */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">4. 🎙️ Voice Components</h2>
          <p className="text-gray-600 mb-6">
            Voice interaction components using design tokens for consistent styling and animations.
          </p>
          
          <div className="flex items-center justify-center space-x-8 mb-6">
            <div className={`voice-visualizer ${voiceState}`}>
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Current State: <span className="capitalize">{voiceState}</span></p>
              <div className="flex space-x-2">
                {voiceStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => setVoiceState(state)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      voiceState === state 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {voiceStates.map((state) => (
              <div key={state} className={`voice-${state} p-4 rounded-lg text-center transition-all`}>
                <div className="w-8 h-8 rounded-full mx-auto mb-2 bg-current opacity-20"></div>
                <p className="font-medium capitalize">{state}</p>
                <p className="text-xs opacity-75">.voice-{state}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Method 5: Framer Motion with Tokens */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">5. 🎬 Framer Motion with Tokens</h2>
          <p className="text-gray-600 mb-6">
            Smooth animations using design tokens for consistent timing and easing.
          </p>
          
          <div className="flex justify-center space-x-4">
            <motion.div
              className="w-20 h-20 rounded-lg"
              style={{ backgroundColor: tokens.colors.primary?.['500'] }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: parseFloat(tokens.transitions?.duration?.normal || '300ms') / 1000,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            <motion.div
              className="w-20 h-20 rounded-full"
              style={{ backgroundColor: tokens.colors.secondary?.['500'] }}
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: parseFloat(tokens.transitions?.duration?.slow || '500ms') / 1000,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            <motion.div
              className="w-20 h-20 rounded-lg"
              style={{ backgroundColor: tokens.colors.voice?.listening || '#3b82f6' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: parseFloat(tokens.animations?.voicePulse?.duration || '1000ms') / 1000,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </section>

        {/* Method 6: Tailwind Classes with Tokens */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">6. 🎨 Tailwind CSS with Tokens</h2>
          <p className="text-gray-600 mb-6">
            Tailwind classes automatically generated from your design tokens.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-100 border border-primary-200 rounded-lg p-6">
              <h3 className="text-primary-700 font-semibold mb-2">Primary Theme</h3>
              <p className="text-primary-600 text-sm">
                Using .bg-primary-100, .border-primary-200, .text-primary-700
              </p>
            </div>
            
            <div className="bg-secondary-100 border border-secondary-200 rounded-xl p-6">
              <h3 className="text-secondary-700 font-semibold mb-2">Secondary Theme</h3>
              <p className="text-secondary-600 text-sm">
                Using .bg-secondary-100, .rounded-xl, .p-6
              </p>
            </div>
            
            <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-8">
              <h3 className="text-neutral-700 font-semibold mb-2">Neutral Theme</h3>
              <p className="text-neutral-600 text-sm">
                Using .bg-neutral-100, .rounded-2xl, .p-8
              </p>
            </div>
          </div>
        </section>

        {/* Real-time Updates */}
        <section className="demo-card">
          <h2 className="text-2xl font-semibold mb-4">7. 🔄 Real-time Updates</h2>
          <p className="text-gray-600 mb-6">
            When you update tokens.json (via Tokens Studio), everything updates automatically!
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-800 font-medium mb-3">🔄 Sync Workflow</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
              <li>Designer updates tokens in Tokens Studio (Figma)</li>
              <li>Tokens Studio pushes changes to GitHub automatically</li>
              <li>Developer pulls repository: <code className="bg-blue-200 px-1 rounded">git pull origin main</code></li>
              <li>Run: <code className="bg-blue-200 px-1 rounded">npm run tokens:update</code></li>
              <li>🎉 All components automatically use new tokens!</li>
            </ol>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => window.open('/tokens.json', '_blank')}
              className="demo-button"
            >
              📄 View tokens.json
            </button>
            <button
              onClick={refresh}
              className="demo-button"
            >
              🔄 Refresh Tokens
            </button>
            <button
              onClick={() => window.open('https://github.com/sixi3/eqAIDemo/blob/main/tokens.json', '_blank')}
              className="demo-button"
            >
              🌐 GitHub File
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎯 Your Project is Now Token-Driven!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Every component, style, and animation in your project now uses tokens.json as the single source of truth.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🎨</div>
              <strong>Design Consistency</strong>
              <p className="text-gray-600 mt-1">All colors, spacing, and typography come from one source</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">🔄</div>
              <strong>Real-time Sync</strong>
              <p className="text-gray-600 mt-1">Changes in Figma automatically update your entire codebase</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">⚡</div>
              <strong>Developer Experience</strong>
              <p className="text-gray-600 mt-1">Multiple ways to use tokens: CSS, React hooks, Tailwind classes</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TokensShowcase; 