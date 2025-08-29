#!/usr/bin/env node

import { logger } from '../utils/logger.js';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface DesignSystem {
  colors: BrandColors;
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export class UXDesignAgent {
  private designSystem: DesignSystem;

  constructor() {
    this.designSystem = this.createEducatorKitDesignSystem();
  }

  /**
   * Create the standardized design system for Educator Kit
   */
  private createEducatorKitDesignSystem(): DesignSystem {
    return {
      colors: {
        // Primary brand colors - Black to bright orange/yellow gradient
        primary: '#000000', // Pure black
        secondary: '#FF6B35', // Bright orange
        accent: '#FFD700', // Bright yellow
        
        // Background and surface colors - Different shades of gray
        background: '#F8F9FA', // Light gray background
        surface: '#FFFFFF', // White surface
        text: '#1A1A1A', // Dark gray text
        textSecondary: '#6B7280', // Medium gray secondary text
        border: '#E5E7EB', // Light gray border
        
        // Semantic colors
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        error: '#EF4444', // Red
        info: '#3B82F6' // Blue
      },
      typography: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem'
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }
    };
  }

  /**
   * Get the complete design system
   */
  getDesignSystem(): DesignSystem {
    return this.designSystem;
  }

  /**
   * Get brand colors
   */
  getBrandColors(): BrandColors {
    return this.designSystem.colors;
  }

  /**
   * Generate CSS variables for the design system
   */
  generateCSSVariables(): string {
    const { colors, typography, spacing, borderRadius, shadows } = this.designSystem;
    
    return `
:root {
  /* Brand Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  
  /* Background & Surface */
  --color-background: ${colors.background};
  --color-surface: ${colors.surface};
  
  /* Text Colors */
  --color-text: ${colors.text};
  --color-text-secondary: ${colors.textSecondary};
  --color-border: ${colors.border};
  
  /* Semantic Colors */
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-error: ${colors.error};
  --color-info: ${colors.info};
  
  /* Typography */
  --font-family: ${typography.fontFamily};
  --font-size-xs: ${typography.fontSize.xs};
  --font-size-sm: ${typography.fontSize.sm};
  --font-size-base: ${typography.fontSize.base};
  --font-size-lg: ${typography.fontSize.lg};
  --font-size-xl: ${typography.fontSize.xl};
  --font-size-2xl: ${typography.fontSize['2xl']};
  --font-size-3xl: ${typography.fontSize['3xl']};
  
  /* Font Weights */
  --font-weight-normal: ${typography.fontWeight.normal};
  --font-weight-medium: ${typography.fontWeight.medium};
  --font-weight-semibold: ${typography.fontWeight.semibold};
  --font-weight-bold: ${typography.fontWeight.bold};
  
  /* Spacing */
  --spacing-xs: ${spacing.xs};
  --spacing-sm: ${spacing.sm};
  --spacing-md: ${spacing.md};
  --spacing-lg: ${spacing.lg};
  --spacing-xl: ${spacing.xl};
  --spacing-2xl: ${spacing['2xl']};
  
  /* Border Radius */
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-full: ${borderRadius.full};
  
  /* Shadows */
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
}

/* Gradient Utilities */
.gradient-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
}

.gradient-text {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Brand Color Classes */
.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-accent { background-color: var(--color-accent); }
.bg-surface { background-color: var(--color-surface); }

.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.text-accent { color: var(--color-accent); }
.text-surface { color: var(--color-surface); }

.border-primary { border-color: var(--color-primary); }
.border-secondary { border-color: var(--color-secondary); }
.border-accent { border-color: var(--color-accent); }
.border-surface { border-color: var(--color-surface); }
`;
  }

  /**
   * Generate Tailwind CSS configuration
   */
  generateTailwindConfig(): string {
    return `
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '${this.designSystem.colors.primary}',
          secondary: '${this.designSystem.colors.secondary}',
          accent: '${this.designSystem.colors.accent}',
        },
        surface: {
          DEFAULT: '${this.designSystem.colors.surface}',
          background: '${this.designSystem.colors.background}',
        },
        text: {
          DEFAULT: '${this.designSystem.colors.text}',
          secondary: '${this.designSystem.colors.textSecondary}',
        },
        border: '${this.designSystem.colors.border}',
        success: '${this.designSystem.colors.success}',
        warning: '${this.designSystem.colors.warning}',
        error: '${this.designSystem.colors.error}',
        info: '${this.designSystem.colors.info}',
      },
      fontFamily: {
        sans: ['${this.designSystem.typography.fontFamily.split(',')[0]}', 'sans-serif'],
      },
      fontSize: {
        xs: ['${this.designSystem.typography.fontSize.xs}', '1.5'],
        sm: ['${this.designSystem.typography.fontSize.sm}', '1.5'],
        base: ['${this.designSystem.typography.fontSize.base}', '1.5'],
        lg: ['${this.designSystem.typography.fontSize.lg}', '1.5'],
        xl: ['${this.designSystem.typography.fontSize.xl}', '1.5'],
        '2xl': ['${this.designSystem.typography.fontSize['2xl']}', '1.25'],
        '3xl': ['${this.designSystem.typography.fontSize['3xl']}', '1.25'],
      },
      fontWeight: {
        normal: '${this.designSystem.typography.fontWeight.normal}',
        medium: '${this.designSystem.typography.fontWeight.medium}',
        semibold: '${this.designSystem.typography.fontWeight.semibold}',
        bold: '${this.designSystem.typography.fontWeight.bold}',
      },
      spacing: {
        xs: '${this.designSystem.spacing.xs}',
        sm: '${this.designSystem.spacing.sm}',
        md: '${this.designSystem.spacing.md}',
        lg: '${this.designSystem.spacing.lg}',
        xl: '${this.designSystem.spacing.xl}',
        '2xl': '${this.designSystem.spacing['2xl']}',
      },
      borderRadius: {
        sm: '${this.designSystem.borderRadius.sm}',
        md: '${this.designSystem.borderRadius.md}',
        lg: '${this.designSystem.borderRadius.lg}',
        full: '${this.designSystem.borderRadius.full}',
      },
      boxShadow: {
        sm: '${this.designSystem.shadows.sm}',
        md: '${this.designSystem.shadows.md}',
        lg: '${this.designSystem.shadows.lg}',
        xl: '${this.designSystem.shadows.xl}',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, ${this.designSystem.colors.primary} 0%, ${this.designSystem.colors.secondary} 50%, ${this.designSystem.colors.accent} 100%)',
        'gradient-secondary': 'linear-gradient(135deg, ${this.designSystem.colors.secondary} 0%, ${this.designSystem.colors.accent} 100%)',
      },
    },
  },
  plugins: [],
}
`;
  }

  /**
   * Generate component styles for common UI elements
   */
  generateComponentStyles(): string {
    return `
/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text);
  border: 2px solid var(--color-secondary);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--color-secondary);
  color: var(--color-primary);
}

/* Card Styles */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.card-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%);
  color: var(--color-surface);
}

/* Input Styles */
.input {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

/* Badge Styles */
.badge {
  background: var(--color-secondary);
  color: var(--color-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.badge-success { background: var(--color-success); color: white; }
.badge-warning { background: var(--color-warning); color: white; }
.badge-error { background: var(--color-error); color: white; }
.badge-info { background: var(--color-info); color: white; }

/* Navigation Styles */
.nav-item {
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: var(--color-secondary);
  background: rgba(255, 107, 53, 0.1);
}

.nav-item.active {
  color: var(--color-secondary);
  background: rgba(255, 107, 53, 0.1);
  border-bottom: 2px solid var(--color-secondary);
}
`;
  }

  /**
   * Generate a complete CSS file with all styles
   */
  generateCompleteCSS(): string {
    return `${this.generateCSSVariables()}\n${this.generateComponentStyles()}`;
  }

  /**
   * Create a design token file for development
   */
  generateDesignTokens(): object {
    return {
      name: "Educator Kit Design System",
      version: "1.0.0",
      colors: this.designSystem.colors,
      typography: this.designSystem.typography,
      spacing: this.designSystem.spacing,
      borderRadius: this.designSystem.borderRadius,
      shadows: this.designSystem.shadows
    };
  }

  /**
   * Validate color contrast ratios for accessibility
   */
  validateAccessibility(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check primary text contrast
    const primaryContrast = this.calculateContrastRatio(this.designSystem.colors.primary, this.designSystem.colors.surface);
    if (primaryContrast < 4.5) {
      issues.push(`Primary text contrast ratio (${primaryContrast.toFixed(2)}) is below WCAG AA standard (4.5)`);
    }
    
    // Check secondary text contrast
    const secondaryContrast = this.calculateContrastRatio(this.designSystem.colors.textSecondary, this.designSystem.colors.surface);
    if (secondaryContrast < 3.0) {
      issues.push(`Secondary text contrast ratio (${secondaryContrast.toFixed(2)}) is below WCAG AA standard (3.0)`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation - in a real implementation, you'd use a proper color library
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color
   */
  private getLuminance(color: string): number {
    // Simplified luminance calculation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  }

  /**
   * Generate a color palette with variations
   */
  generateColorPalette(): object {
    return {
      primary: {
        50: '#f8f9fa',
        100: '#e9ecef',
        200: '#dee2e6',
        300: '#ced4da',
        400: '#adb5bd',
        500: '#6c757d',
        600: '#495057',
        700: '#343a40',
        800: '#212529',
        900: '#000000'
      },
      secondary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#FF6B35',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12'
      },
      accent: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#FFD700',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12'
      }
    };
  }
}

// Create and export instance
export const uxDesignAgent = new UXDesignAgent();
