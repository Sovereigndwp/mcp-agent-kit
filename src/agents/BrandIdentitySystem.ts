export interface BrandColors {
  primary_gradient: {
    start: string;
    end: string;
    css: string;
  };
  backgrounds: {
    primary: string;
    secondary: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
  };
  accent_colors: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface BrandGuidelines {
  colors: BrandColors;
  typography: {
    primary_font: string;
    code_font: string;
    sizes: Record<string, string>;
  };
  voice: {
    tone: string[];
    avoid: string[];
    personality_traits: string[];
  };
  visual_elements: {
    icons: string[];
    symbols: string[];
    patterns: string[];
  };
}

export class BrandIdentitySystem {
  private brandColors: BrandColors = {
    primary_gradient: {
      start: "#FF8C00", // Bright Orange
      end: "#FFD700",   // Bright Yellow  
      css: "linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)"
    },
    backgrounds: {
      primary: "#000000",   // True Black
      secondary: "#1A1A1A", // Dark Gray
      card: "#2A2A2A"       // Medium Gray
    },
    text: {
      primary: "#FFFFFF",   // Pure White
      secondary: "#E0E0E0", // Light Gray
      accent: "#FF8C00",    // Brand Orange
      muted: "#888888"      // Medium Gray
    },
    accent_colors: {
      success: "#32CD32",   // Lime Green
      warning: "#FF6347",   // Tomato Red
      error: "#DC143C",     // Crimson
      info: "#4169E1"       // Royal Blue
    }
  };

  private brandGuidelines: BrandGuidelines = {
    colors: this.brandColors,
    typography: {
      primary_font: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      code_font: "'SF Mono', 'Monaco', 'Inconsolata', monospace",
      sizes: {
        hero: "clamp(2.5rem, 5vw, 4rem)",
        title: "clamp(1.8rem, 3vw, 2.5rem)",
        subtitle: "clamp(1.2rem, 2vw, 1.5rem)",
        body: "1rem",
        small: "0.875rem"
      }
    },
    voice: {
      tone: [
        "Direct and confident",
        "Curious and questioning", 
        "Warm but professional",
        "Knowledgeable without being condescending",
        "Encouraging discovery"
      ],
      avoid: [
        "Corporate jargon",
        "Overly technical without explanation",
        "Condescending language",
        "Generic motivational speak",
        "AI-like formatting patterns"
      ],
      personality_traits: [
        "Socratic teacher",
        "First-principles thinker", 
        "Accessibility advocate",
        "Discovery facilitator",
        "Authentic educator"
      ]
    },
    visual_elements: {
      icons: [
        "🧠", // Thinking/discovery
        "⚡", // Energy/power  
        "🔍", // Investigation/search
        "💡", // Insights/ideas
        "🎯", // Focus/precision
        "🌅", // New beginnings/dawn
        "⭐", // Excellence/achievement
        "🔑", // Key insights/access
        "🚀", // Growth/launch (sparingly)
        "🧩"  // Puzzle pieces/understanding
      ],
      symbols: [
        "→", // Flow/progression
        "•", // List items  
        "▶", // Play/start
        "↗", // Growth/improvement
        "∴", // Therefore/conclusion
        "≠", // Different/unique
        "±", // Variable/flexible
        "∞"  // Unlimited potential
      ],
      patterns: [
        "Gradient backgrounds with subtle texture",
        "Clean geometric shapes",
        "Asymmetrical layouts that feel natural",
        "Generous white space",
        "Subtle shadows and depth"
      ]
    }
  };

  getBrandColors(): BrandColors {
    return this.brandColors;
  }

  getBrandGuidelines(): BrandGuidelines {
    return this.brandGuidelines;
  }

  generateCSS(): string {
    return `
:root {
  /* Primary Brand Gradient */
  --brand-gradient: ${this.brandColors.primary_gradient.css};
  --brand-orange: ${this.brandColors.primary_gradient.start};
  --brand-yellow: ${this.brandColors.primary_gradient.end};
  
  /* Backgrounds */
  --bg-primary: ${this.brandColors.backgrounds.primary};
  --bg-secondary: ${this.brandColors.backgrounds.secondary};
  --bg-card: ${this.brandColors.backgrounds.card};
  
  /* Text Colors */
  --text-primary: ${this.brandColors.text.primary};
  --text-secondary: ${this.brandColors.text.secondary};
  --text-accent: ${this.brandColors.text.accent};
  --text-muted: ${this.brandColors.text.muted};
  
  /* Accent Colors */
  --success: ${this.brandColors.accent_colors.success};
  --warning: ${this.brandColors.accent_colors.warning};
  --error: ${this.brandColors.accent_colors.error};
  --info: ${this.brandColors.accent_colors.info};
  
  /* Typography */
  --font-primary: ${this.brandGuidelines.typography.primary_font};
  --font-code: ${this.brandGuidelines.typography.code_font};
  
  /* Typography Sizes */
  --text-hero: ${this.brandGuidelines.typography.sizes.hero};
  --text-title: ${this.brandGuidelines.typography.sizes.title};
  --text-subtitle: ${this.brandGuidelines.typography.sizes.subtitle};
  --text-body: ${this.brandGuidelines.typography.sizes.body};
  --text-small: ${this.brandGuidelines.typography.sizes.small};
}

/* Brand Gradient Classes */
.brand-gradient {
  background: var(--brand-gradient);
}

.brand-gradient-text {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Button Styles */
.btn-brand {
  background: var(--brand-gradient);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-brand:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 140, 0, 0.3);
}
`;
  }

  generateSocialMediaAssets(): {
    twitter_header: string;
    profile_colors: string;
    post_templates: string[];
  } {
    return {
      twitter_header: `
/* Twitter Header CSS for design tools */
background: linear-gradient(135deg, #000000 0%, #1A1A1A 50%, #000000 100%);
accent: linear-gradient(135deg, #FF8C00 0%, #FFD700 100%);
text: #FFFFFF;
`,
      profile_colors: `
Primary: #FF8C00 (Bright Orange)
Secondary: #FFD700 (Bright Yellow)
Background: #000000 (Black)
Text: #FFFFFF (White)
`,
      post_templates: [
        "Question-first format with gradient accent",
        "Discovery insight with orange highlight", 
        "First-principles breakdown with numbered points",
        "Student success story with yellow emphasis",
        "Technical concept with visual hierarchy"
      ]
    };
  }
}

export const brandIdentitySystem = new BrandIdentitySystem();