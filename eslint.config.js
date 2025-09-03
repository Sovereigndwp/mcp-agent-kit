import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Ignore dist directory completely
  {
    ignores: [
      "dist/**", 
      "node_modules/**", 
      "*.d.ts", 
      "exports/**", 
      "src/types/**",
      "src/agents/btc-mcp-agent/src/tests/app.tests.tsx"
    ]
  },
  
  // Base configuration for all files
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        NodeJS: 'readonly',
        React: 'readonly',
        Element: 'readonly'
      }
    },
    rules: { 
      "no-console": "off",
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-case-declarations": "warn",
      "formatjs/no-literal-string-in-jsx": "off"
    }
  },
  
  // TypeScript configuration - more lenient
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-case-declarations": "off"
    }
  },
  
  // Configuration for btc-mcp-agent files - very lenient
  {
    files: ["src/agents/btc-mcp-agent/**/*"],
    rules: {
      "formatjs/no-literal-string-in-jsx": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off"
    }
  },
  
  // Configuration for web files (browser environment)
  {
    files: ["src/web/**/*.js", "src/web/**/*.ts"],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        Intl: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        console: 'readonly'
      }
    }
  }
];
