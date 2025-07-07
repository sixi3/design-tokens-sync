import React from 'react';
import { useTokens } from '../../utils/tokens-loader';

// Example component showing how to use tokens from tokens.json
export const TokensExample: React.FC = () => {
  const { tokens, loading, error, refresh } = useTokens();

  if (loading) {
    return <div className="p-4">Loading tokens...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
        <button 
          onClick={refresh}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!tokens) {
    return <div className="p-4">No tokens available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">🎨 Design Tokens Demo</h2>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">
          Source: <strong>{tokens.source}</strong> | 
          Last loaded: <strong>{new Date(tokens.lastLoaded).toLocaleString()}</strong>
        </p>
        <button
          onClick={refresh}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Colors Demo */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(tokens.colors).map(([category, shades]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm capitalize">{category}</h4>
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
      </div>

      {/* Spacing Demo */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Spacing</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {Object.entries(tokens.spacing).slice(0, 16).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="bg-blue-200 mx-auto mb-1"
                style={{ width: value, height: '1rem' }}
              />
              <span className="text-xs font-mono">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Border Radius Demo */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Border Radius</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {Object.entries(tokens.borderRadius).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="w-12 h-12 bg-purple-200 mx-auto mb-1"
                style={{ borderRadius: value }}
              />
              <span className="text-xs font-mono">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Example */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold mb-2">💡 Usage Example</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
{`import { useTokens } from '../utils/tokens-loader';

function MyComponent() {
  const { tokens } = useTokens();
  
  return (
    <div style={{
      backgroundColor: tokens?.colors.primary?.['500'],
      padding: tokens?.spacing?.['4'],
      borderRadius: tokens?.borderRadius?.md
    }}>
      Using tokens from ${tokens?.source}!
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
};

export default TokensExample; 