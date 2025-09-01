#!/usr/bin/env node

import { config } from 'dotenv';
import { uxDesignAgent } from '../agents/UXDesignAgent.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

// Load environment variables
config();

export class UXDesignSetup {
  private designSystem: any;

  constructor() {
    this.designSystem = uxDesignAgent.getDesignSystem();
  }

  /**
   * Complete all UX design setup tasks
   */
  async completeAllTasks(): Promise<void> {
    console.log('🎨 Starting UX Design Agent Setup...\n');

    try {
      // 1. Generate complete CSS file
      await this.generateCSSFile();

      // 2. Create Tailwind configuration
      await this.createTailwindConfig();

      // 3. Validate accessibility
      await this.validateAccessibility();

      // 4. Generate design tokens
      await this.generateDesignTokens();

      // 5. Update web interface with brand colors
      await this.updateWebInterface();

      // 6. Create component library
      await this.createComponentLibrary();

      console.log('✅ All UX Design tasks completed successfully!\n');
      console.log('🎉 Your Educator Kit now has a complete design system!');
      console.log('📁 Generated files:');
      console.log('   - src/web/public/brand.css');
      console.log('   - tailwind.config.js');
      console.log('   - design-tokens.json');
      console.log('   - component-library.html');
      console.log('   - accessibility-report.json');

    } catch (error) {
      logger.error('Failed to complete UX design setup:', error);
      throw error;
    }
  }

  /**
   * Generate complete CSS file with brand colors
   */
  private async generateCSSFile(): Promise<void> {
    console.log('🎨 Generating complete CSS file...');
    
    const cssContent = uxDesignAgent.generateCompleteCSS();
    const cssPath = join(process.cwd(), 'src', 'web', 'public', 'brand.css');
    
    // Ensure directory exists
    mkdirSync(join(process.cwd(), 'src', 'web', 'public'), { recursive: true });
    
    writeFileSync(cssPath, cssContent);
    console.log('   ✅ CSS file generated: src/web/public/brand.css');
  }

  /**
   * Create Tailwind configuration
   */
  private async createTailwindConfig(): Promise<void> {
    console.log('🎨 Creating Tailwind configuration...');
    
    const tailwindConfig = uxDesignAgent.generateTailwindConfig();
    const configPath = join(process.cwd(), 'tailwind.config.js');
    
    writeFileSync(configPath, tailwindConfig);
    console.log('   ✅ Tailwind config generated: tailwind.config.js');
  }

  /**
   * Validate accessibility
   */
  private async validateAccessibility(): Promise<void> {
    console.log('🎨 Validating accessibility...');
    
    const accessibility = uxDesignAgent.validateAccessibility();
    const reportPath = join(process.cwd(), 'accessibility-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      valid: accessibility.valid,
      issues: accessibility.issues,
      recommendations: this.generateAccessibilityRecommendations(accessibility)
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    if (accessibility.valid) {
      console.log('   ✅ Accessibility validation passed!');
    } else {
      console.log('   ⚠️  Accessibility issues found:');
      accessibility.issues.forEach(issue => console.log(`      - ${issue}`));
    }
    console.log('   📄 Report saved: accessibility-report.json');
  }

  /**
   * Generate accessibility recommendations
   */
  private generateAccessibilityRecommendations(accessibility: any): string[] {
    const recommendations = [];
    
    if (!accessibility.valid) {
      recommendations.push('Consider adjusting color contrast ratios to meet WCAG AA standards');
      recommendations.push('Test color combinations with color blindness simulators');
      recommendations.push('Ensure sufficient color contrast for all text elements');
    }
    
    recommendations.push('Use semantic HTML elements for better screen reader support');
    recommendations.push('Provide alternative text for all images and icons');
    recommendations.push('Test keyboard navigation throughout the interface');
    
    return recommendations;
  }

  /**
   * Generate design tokens
   */
  private async generateDesignTokens(): Promise<void> {
    console.log('🎨 Generating design tokens...');
    
    const designTokens = uxDesignAgent.generateDesignTokens();
    const colorPalette = uxDesignAgent.generateColorPalette();
    
    const tokens = {
      ...designTokens,
      colorPalette,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        description: 'Educator Kit Design System Tokens'
      }
    };
    
    const tokensPath = join(process.cwd(), 'design-tokens.json');
    writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    console.log('   ✅ Design tokens generated: design-tokens.json');
  }

  /**
   * Update web interface with brand colors
   */
  private async updateWebInterface(): Promise<void> {
    console.log('🎨 Updating web interface with brand colors...');
    
    // Update the HTML to include the brand CSS
    const htmlPath = join(process.cwd(), 'src', 'web', 'public', 'index.html');
    let htmlContent = '';
    
    try {
      const fs = await import('fs/promises');
      htmlContent = await fs.readFile(htmlPath, 'utf-8');
      
      // Add brand CSS link if not already present
      if (!htmlContent.includes('brand.css')) {
        htmlContent = htmlContent.replace(
          '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">',
          `<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="brand.css" rel="stylesheet">`
        );
      }
      
      await fs.writeFile(htmlPath, htmlContent);
      console.log('   ✅ Web interface updated with brand CSS');
      
    } catch (error) {
      console.log('   ⚠️  Could not update HTML file (may not exist yet)');
    }
  }

  /**
   * Create component library
   */
  private async createComponentLibrary(): Promise<void> {
    console.log('🎨 Creating component library...');
    
    const componentLibrary = this.generateComponentLibraryHTML();
    const libraryPath = join(process.cwd(), 'component-library.html');
    
    writeFileSync(libraryPath, componentLibrary);
    console.log('   ✅ Component library generated: component-library.html');
  }

  /**
   * Generate component library HTML
   */
  private generateComponentLibraryHTML(): string {
    const colors = uxDesignAgent.getBrandColors();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Educator Kit - Component Library</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center space-x-3">
                <i class="fas fa-bitcoin text-3xl"></i>
                <div>
                    <h1 class="text-2xl font-bold">Educator Kit</h1>
                    <p class="text-sm opacity-90">Component Library</p>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">Design System Components</h2>

        <!-- Color Palette -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Color Palette</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-black text-white p-4 rounded-lg text-center">
                    <div class="text-sm font-medium">Primary</div>
                    <div class="text-xs opacity-75">#000000</div>
                </div>
                <div class="bg-orange-500 text-black p-4 rounded-lg text-center">
                    <div class="text-sm font-medium">Secondary</div>
                    <div class="text-xs opacity-75">#FF6B35</div>
                </div>
                <div class="bg-yellow-400 text-black p-4 rounded-lg text-center">
                    <div class="text-sm font-medium">Accent</div>
                    <div class="text-xs opacity-75">#FFD700</div>
                </div>
                <div class="bg-gray-100 text-gray-900 p-4 rounded-lg text-center">
                    <div class="text-sm font-medium">Background</div>
                    <div class="text-xs opacity-75">#F8F9FA</div>
                </div>
            </div>
        </section>

        <!-- Buttons -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Buttons</h3>
            <div class="space-y-4">
                <div class="flex flex-wrap gap-4">
                    <button class="btn-primary">Primary Button</button>
                    <button class="btn-secondary">Secondary Button</button>
                    <button class="bg-gray-500 text-white px-4 py-2 rounded-md">Disabled Button</button>
                </div>
            </div>
        </section>

        <!-- Cards -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Cards</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card card-hover">
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">Standard Card</h4>
                    <p class="text-gray-600">This is a standard card with hover effects.</p>
                </div>
                <div class="card-gradient card-hover">
                    <h4 class="text-lg font-semibold mb-2">Gradient Card</h4>
                    <p>This card uses the brand gradient background.</p>
                </div>
                <div class="card card-hover">
                    <h4 class="text-lg font-semibold text-gray-900 mb-2">Interactive Card</h4>
                    <p class="text-gray-600">Hover over this card to see the animation.</p>
                </div>
            </div>
        </section>

        <!-- Form Elements -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Form Elements</h3>
            <div class="max-w-md space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Text Input</label>
                    <input type="text" class="input w-full" placeholder="Enter text here">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Select Dropdown</label>
                    <select class="input w-full">
                        <option>Option 1</option>
                        <option>Option 2</option>
                        <option>Option 3</option>
                    </select>
                </div>
            </div>
        </section>

        <!-- Badges -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Badges</h3>
            <div class="flex flex-wrap gap-4">
                <span class="badge">Default Badge</span>
                <span class="badge-success">Success Badge</span>
                <span class="badge-warning">Warning Badge</span>
                <span class="badge-error">Error Badge</span>
                <span class="badge-info">Info Badge</span>
            </div>
        </section>

        <!-- Typography -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Typography</h3>
            <div class="space-y-4">
                <h1 class="text-3xl font-bold text-gray-900">Heading 1 - 3xl Bold</h1>
                <h2 class="text-2xl font-semibold text-gray-900">Heading 2 - 2xl Semibold</h2>
                <h3 class="text-xl font-medium text-gray-900">Heading 3 - xl Medium</h3>
                <p class="text-base text-gray-700">Body text - base size with good readability</p>
                <p class="text-sm text-gray-600">Small text - for secondary information</p>
            </div>
        </section>

        <!-- Gradients -->
        <section class="mb-12">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">Gradients</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="gradient-primary h-32 rounded-lg flex items-center justify-center">
                    <span class="text-white font-semibold">Primary Gradient</span>
                </div>
                <div class="gradient-secondary h-32 rounded-lg flex items-center justify-center">
                    <span class="text-black font-semibold">Secondary Gradient</span>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-6">
            <div class="text-center">
                <p>&copy; 2024 Educator Kit. Built with ❤️ for learning.</p>
            </div>
        </div>
    </footer>
</body>
</html>`;
  }
}

// Create and export instance
export const uxDesignSetup = new UXDesignSetup();

// Main execution function
async function main() {
  try {
    const setup = new UXDesignSetup();
    await setup.completeAllTasks();
    
    console.log('\n🚀 Next steps:');
    console.log('1. Open component-library.html to see all components');
    console.log('2. Include brand.css in your web interface');
    console.log('3. Use the Tailwind config for consistent styling');
    console.log('4. Check accessibility-report.json for any issues');
    
  } catch (error) {
    console.error('❌ Failed to complete UX design setup:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}
