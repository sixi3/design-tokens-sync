// Utility to load and sync tokens.json with the design system
// This bridges the gap between Tokens Studio and our React components

interface TokensJson {
  colors?: {
    [category: string]: {
      [shade: string]: {
        $value: string;
        $type: string;
        $description?: string;
      };
    };
  };
  spacing?: {
    [key: string]: {
      $value: string;
      $type: string;
      $description?: string;
    };
  };
  borderRadius?: {
    [key: string]: {
      $value: string;
      $type: string;
      $description?: string;
    };
  };
  typography?: {
    [category: string]: {
      [key: string]: {
        $value: string | number;
        $type: string;
        $description?: string;
      };
    };
  };
  [key: string]: any;
}

interface LoadedTokens {
  colors: {
    [category: string]: {
      [shade: string]: string;
    };
  };
  spacing: {
    [key: string]: string;
  };
  borderRadius: {
    [key: string]: string;
  };
  typography: any;
  lastLoaded: string;
  source: 'tokens.json' | 'design-system' | 'mixed';
}

class TokensLoader {
  private tokens: LoadedTokens | null = null;
  private listeners: Array<(tokens: LoadedTokens) => void> = [];

  // Load tokens from tokens.json file
  async loadFromFile(): Promise<LoadedTokens> {
    try {
      const response = await fetch('/tokens.json');
      if (!response.ok) {
        throw new Error(`Failed to load tokens.json: ${response.status}`);
      }
      
      const tokensJson: TokensJson = await response.json();
      const loadedTokens = this.parseTokensJson(tokensJson);
      
      this.tokens = {
        ...loadedTokens,
        lastLoaded: new Date().toISOString(),
        source: 'tokens.json'
      };
      
      this.notifyListeners();
      return this.tokens;
      
    } catch (error) {
      console.warn('Failed to load tokens.json, falling back to design system:', error);
      return this.loadFromDesignSystem();
    }
  }

  // Load tokens from TypeScript design system
  async loadFromDesignSystem(): Promise<LoadedTokens> {
    try {
      const { DESIGN_SYSTEM_THEME } = await import('./design-system');
      
             this.tokens = {
         colors: DESIGN_SYSTEM_THEME.colors,
         spacing: DESIGN_SYSTEM_THEME.spacing,
         borderRadius: DESIGN_SYSTEM_THEME.borderRadius,
         typography: DESIGN_SYSTEM_THEME.typography as any,
         lastLoaded: new Date().toISOString(),
         source: 'design-system'
       };
      
      this.notifyListeners();
      return this.tokens;
      
    } catch (error) {
      console.error('Failed to load design system:', error);
      throw error;
    }
  }

  // Parse tokens.json format to our internal format
  private parseTokensJson(tokensJson: TokensJson): Omit<LoadedTokens, 'lastLoaded' | 'source'> {
    const parsed: Omit<LoadedTokens, 'lastLoaded' | 'source'> = {
      colors: {},
      spacing: {},
      borderRadius: {},
      typography: null
    };

    // Parse colors
    if (tokensJson.colors) {
      for (const [category, shades] of Object.entries(tokensJson.colors)) {
        parsed.colors[category] = {};
        for (const [shade, token] of Object.entries(shades)) {
          parsed.colors[category][shade] = token.$value;
        }
      }
    }

    // Parse spacing
    if (tokensJson.spacing) {
      for (const [key, token] of Object.entries(tokensJson.spacing)) {
        parsed.spacing[key] = token.$value;
      }
    }

    // Parse border radius
    if (tokensJson.borderRadius) {
      for (const [key, token] of Object.entries(tokensJson.borderRadius)) {
        parsed.borderRadius[key] = token.$value;
      }
    }

    // Parse typography
    if (tokensJson.typography) {
      parsed.typography = {};
      for (const [category, tokens] of Object.entries(tokensJson.typography)) {
        parsed.typography[category] = {};
        for (const [key, token] of Object.entries(tokens)) {
          parsed.typography[category][key] = token.$value;
        }
      }
    }

    return parsed;
  }

  // Get current tokens (load if not already loaded)
  async getTokens(): Promise<LoadedTokens> {
    if (!this.tokens) {
      return await this.loadFromFile();
    }
    return this.tokens;
  }

  // Refresh tokens from source
  async refresh(): Promise<LoadedTokens> {
    return await this.loadFromFile();
  }

  // Subscribe to token changes
  subscribe(callback: (tokens: LoadedTokens) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of token changes
  private notifyListeners(): void {
    if (this.tokens) {
      this.listeners.forEach(callback => callback(this.tokens!));
    }
  }

  // Get token status and info
  getStatus(): {
    isLoaded: boolean;
    source: string;
    lastLoaded: string | null;
    tokenCount: number;
  } {
    if (!this.tokens) {
      return {
        isLoaded: false,
        source: 'none',
        lastLoaded: null,
        tokenCount: 0
      };
    }

    const tokenCount = 
      Object.keys(this.tokens.colors).length +
      Object.keys(this.tokens.spacing).length +
      Object.keys(this.tokens.borderRadius).length +
      (this.tokens.typography ? Object.keys(this.tokens.typography).length : 0);

    return {
      isLoaded: true,
      source: this.tokens.source,
      lastLoaded: this.tokens.lastLoaded,
      tokenCount
    };
  }

  // Check if tokens.json is available
  async isTokensJsonAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/tokens.json', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Compare tokens.json with design system
  async compareWithDesignSystem(): Promise<{
    differences: Array<{
      path: string;
      tokensJson: any;
      designSystem: any;
    }>;
    tokensJsonOnly: string[];
    designSystemOnly: string[];
  }> {
    const [tokensFromJson, tokensFromDesignSystem] = await Promise.all([
      this.loadFromFile(),
      this.loadFromDesignSystem()
    ]);

    const differences: Array<{
      path: string;
      tokensJson: any;
      designSystem: any;
    }> = [];

    const tokensJsonOnly: string[] = [];
    const designSystemOnly: string[] = [];

    // Compare colors
    this.compareObjects(
      tokensFromJson.colors,
      tokensFromDesignSystem.colors,
      'colors',
      differences,
      tokensJsonOnly,
      designSystemOnly
    );

    // Compare spacing
    this.compareObjects(
      tokensFromJson.spacing,
      tokensFromDesignSystem.spacing,
      'spacing',
      differences,
      tokensJsonOnly,
      designSystemOnly
    );

    return {
      differences,
      tokensJsonOnly,
      designSystemOnly
    };
  }

  private compareObjects(
    obj1: any,
    obj2: any,
    basePath: string,
    differences: Array<{ path: string; tokensJson: any; designSystem: any }>,
    obj1Only: string[],
    obj2Only: string[]
  ): void {
    const keys1 = new Set(Object.keys(obj1 || {}));
    const keys2 = new Set(Object.keys(obj2 || {}));
    
    // Keys only in obj1
    for (const key of keys1) {
      if (!keys2.has(key)) {
        obj1Only.push(`${basePath}.${key}`);
      }
    }
    
    // Keys only in obj2
    for (const key of keys2) {
      if (!keys1.has(key)) {
        obj2Only.push(`${basePath}.${key}`);
      }
    }
    
    // Keys in both - check for differences
    for (const key of keys1) {
      if (keys2.has(key)) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        
        if (typeof val1 === 'object' && typeof val2 === 'object') {
          this.compareObjects(val1, val2, `${basePath}.${key}`, differences, obj1Only, obj2Only);
        } else if (val1 !== val2) {
          differences.push({
            path: `${basePath}.${key}`,
            tokensJson: val1,
            designSystem: val2
          });
        }
      }
    }
  }
}

// Export singleton instance
export const tokensLoader = new TokensLoader();

// Export utility functions
export const useTokens = () => {
  const [tokens, setTokens] = React.useState<LoadedTokens | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        const loadedTokens = await tokensLoader.getTokens();
        setTokens(loadedTokens);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tokens');
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    // Subscribe to token changes
    const unsubscribe = tokensLoader.subscribe(setTokens);
    return unsubscribe;
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      const refreshedTokens = await tokensLoader.refresh();
      setTokens(refreshedTokens);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tokens');
    } finally {
      setLoading(false);
    }
  };

  return { tokens, loading, error, refresh };
};

// React import for useTokens hook
import React from 'react'; 