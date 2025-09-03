export interface AuthenticityAnalysis {
  authenticity_score: number; // 0-100
  ai_flags: string[];
  human_elements: string[];
  brand_alignment: number; // 0-100
  voice_consistency: number; // 0-100
  recommendations: string[];
}

export interface ContentPattern {
  pattern_type: 'ai_flag' | 'authentic_marker' | 'brand_element';
  description: string;
  examples: string[];
  weight: number; // Impact on score
}

export class ContentAuthenticityMentor {
  private aiFlags: ContentPattern[] = [
    {
      pattern_type: 'ai_flag',
      description: 'Generic emoji usage (rocket, fire, etc.)',
      examples: ['🚀🚀🚀', '🔥🔥🔥', 'Let\'s dive in 🚀'],
      weight: -15
    },
    {
      pattern_type: 'ai_flag', 
      description: 'Long dash formatting',
      examples: ['——————', '———', 'Here\'s what I learned ———'],
      weight: -20
    },
    {
      pattern_type: 'ai_flag',
      description: 'Generic list intros',
      examples: ['Here are the key takeaways:', 'Let me break this down for you:', '3 things to remember:'],
      weight: -10
    },
    {
      pattern_type: 'ai_flag',
      description: 'Overuse of superlatives',
      examples: ['incredible', 'amazing', 'game-changing', 'revolutionary'],
      weight: -5
    },
    {
      pattern_type: 'ai_flag',
      description: 'Corporate speak',
      examples: ['leverage', 'synergy', 'optimize', 'streamline', 'holistic approach'],
      weight: -12
    },
    {
      pattern_type: 'ai_flag',
      description: 'Generic motivational phrases',
      examples: ['You got this!', 'Take action today!', 'Don\'t miss out!'],
      weight: -8
    },
    {
      pattern_type: 'ai_flag',
      description: 'Numbered list overuse',
      examples: ['1. First...', '2. Second...', '3. Third...', 'Step 1:', 'Point #1'],
      weight: -7
    },
    {
      pattern_type: 'ai_flag',
      description: 'Generic transitions',
      examples: ['Moving on...', 'Next up...', 'Additionally...', 'Furthermore...'],
      weight: -6
    }
  ];

  private authenticMarkers: ContentPattern[] = [
    {
      pattern_type: 'authentic_marker',
      description: 'Personal experience sharing',
      examples: ['When I first discovered...', 'I used to think...', 'My biggest mistake was...'],
      weight: 15
    },
    {
      pattern_type: 'authentic_marker',
      description: 'Specific examples and stories',
      examples: ['For instance, when Sarah tried...', 'Consider this scenario...', 'I remember working with...'],
      weight: 20
    },
    {
      pattern_type: 'authentic_marker',
      description: 'Conversational tone',
      examples: ['You might be wondering...', 'Here\'s the thing though...', 'What if I told you...'],
      weight: 12
    },
    {
      pattern_type: 'authentic_marker',
      description: 'Admitting uncertainty',
      examples: ['I\'m still figuring out...', 'This might not work for everyone...', 'I could be wrong, but...'],
      weight: 18
    },
    {
      pattern_type: 'authentic_marker',
      description: 'Industry-specific language',
      examples: ['UTXO management', 'multisig setup', 'time preference', 'proof of work'],
      weight: 10
    },
    {
      pattern_type: 'authentic_marker',
      description: 'Question-first approach',
      examples: ['What if...?', 'Have you ever wondered...?', 'Why do you think...?'],
      weight: 25
    }
  ];

  private brandElements: ContentPattern[] = [
    {
      pattern_type: 'brand_element',
      description: 'Discovery-focused language',
      examples: ['Let\'s explore...', 'What do you discover when...', 'Think through this...'],
      weight: 20
    },
    {
      pattern_type: 'brand_element', 
      description: 'First-principles references',
      examples: ['From first principles...', 'Starting from scratch...', 'Building up from basics...'],
      weight: 15
    },
    {
      pattern_type: 'brand_element',
      description: 'Socratic questioning',
      examples: ['Before I tell you... what do you think?', 'What would happen if...?', 'How might this work?'],
      weight: 25
    },
    {
      pattern_type: 'brand_element',
      description: 'Educational philosophy alignment', 
      examples: ['Understanding beats memorization', 'Questions before answers', 'Discovery over lecture'],
      weight: 20
    },
    {
      pattern_type: 'brand_element',
      description: 'Accessibility focus',
      examples: ['In simple terms...', 'Think of it like...', 'No jargon needed...'],
      weight: 12
    }
  ];

  analyzeContent(content: string): AuthenticityAnalysis {
    let authenticity_score = 80; // Start at good baseline
    const ai_flags: string[] = [];
    const human_elements: string[] = [];
    let brand_alignment = 60;
    let voice_consistency = 70;

    const contentLower = content.toLowerCase();

    // Check for AI flags
    this.aiFlags.forEach(flag => {
      const flagCount = flag.examples.filter(example => 
        contentLower.includes(example.toLowerCase())
      ).length;
      
      if (flagCount > 0) {
        authenticity_score += flag.weight * flagCount;
        ai_flags.push(`${flag.description} (${flagCount} instances)`);
      }
    });

    // Check for authentic markers
    this.authenticMarkers.forEach(marker => {
      const markerCount = marker.examples.filter(example =>
        contentLower.includes(example.toLowerCase())
      ).length;

      if (markerCount > 0) {
        authenticity_score += marker.weight * markerCount;
        human_elements.push(`${marker.description} (${markerCount} instances)`);
      }
    });

    // Check for brand alignment
    let brandScore = 0;
    let brandElements = 0;
    this.brandElements.forEach(element => {
      const elementCount = element.examples.filter(example =>
        contentLower.includes(example.toLowerCase())
      ).length;

      if (elementCount > 0) {
        brandScore += element.weight * elementCount;
        brandElements += elementCount;
      }
    });

    brand_alignment = Math.min(100, 60 + brandScore);

    // Calculate voice consistency based on tone patterns
    voice_consistency = this.analyzeVoiceConsistency(content);

    // Ensure scores stay within bounds
    authenticity_score = Math.max(0, Math.min(100, authenticity_score));

    const recommendations = this.generateRecommendations(
      authenticity_score, 
      ai_flags, 
      brand_alignment, 
      voice_consistency
    );

    return {
      authenticity_score,
      ai_flags,
      human_elements,
      brand_alignment,
      voice_consistency,
      recommendations
    };
  }

  private analyzeVoiceConsistency(content: string): number {
    let score = 70; // Base score
    
    // Positive voice indicators
    const positivePatterns = [
      /\?([^?]*\?)?/g, // Questions
      /you might|you could|you may/gi, // Inclusive language
      /think about|consider|imagine/gi, // Engagement
      /for example|for instance/gi, // Specific examples
    ];

    positivePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        score += Math.min(matches.length * 3, 15);
      }
    });

    // Negative voice indicators  
    const negativePatterns = [
      /we must|you need to|you should/gi, // Prescriptive language
      /obviously|clearly|simply/gi, // Condescending language
      /leverage|optimize|utilize/gi, // Corporate speak
    ];

    negativePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        score -= matches.length * 5;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateRecommendations(
    authenticity_score: number,
    ai_flags: string[],
    brand_alignment: number,
    voice_consistency: number
  ): string[] {
    const recommendations: string[] = [];

    if (authenticity_score < 70) {
      recommendations.push("🎯 Add more personal experiences and specific examples");
      recommendations.push("🗣️ Use more conversational language and direct address");
    }

    if (ai_flags.length > 0) {
      recommendations.push(`⚠️ Remove ${ai_flags.length} AI-like patterns detected`);
      recommendations.push("✨ Replace generic phrases with specific, personal language");
    }

    if (brand_alignment < 70) {
      recommendations.push("🧠 Add more discovery-focused and Socratic questioning language");
      recommendations.push("🔍 Include more first-principles thinking approaches");
    }

    if (voice_consistency < 70) {
      recommendations.push("💬 Improve voice consistency with more questions and inclusive language");
      recommendations.push("🎭 Remove prescriptive or condescending language patterns");
    }

    // Positive reinforcement
    if (authenticity_score > 85) {
      recommendations.push("✅ Excellent authenticity - this sounds genuinely human and personal");
    }

    if (brand_alignment > 85) {
      recommendations.push("🎯 Great brand alignment - this perfectly matches your educational philosophy");
    }

    return recommendations;
  }

  generateAuthenticTweetAlternatives(originalTweet: string): string[] {
    const alternatives: string[] = [];
    
    // Analyze the original
    const analysis = this.analyzeContent(originalTweet);
    
    if (analysis.ai_flags.length > 0) {
      // Generate more authentic versions
      alternatives.push(this.convertToSocraticStyle(originalTweet));
      alternatives.push(this.convertToPersonalStyle(originalTweet));
      alternatives.push(this.convertToQuestionFirst(originalTweet));
    }

    return alternatives;
  }

  private convertToSocraticStyle(tweet: string): string {
    // Convert statements to questions
    let converted = tweet;
    
    // Replace common patterns
    converted = converted.replace(/Here's what I learned:/gi, "What do you think happens when:");
    converted = converted.replace(/The key is:/gi, "Have you ever wondered why:");
    converted = converted.replace(/You should/gi, "What if you could");
    
    return converted;
  }

  private convertToPersonalStyle(tweet: string): string {
    let converted = tweet;
    
    // Add personal elements
    converted = converted.replace(/People often/gi, "I used to");
    converted = converted.replace(/Studies show/gi, "I discovered");
    converted = converted.replace(/It's important to/gi, "I learned that");
    
    return converted;
  }

  private convertToQuestionFirst(tweet: string): string {
    const sentences = tweet.split(/[.!]\s+/);
    if (sentences.length > 0) {
      // Convert first sentence to a question
      const firstSentence = sentences[0];
      const questionVersion = `${firstSentence.replace(/^[A-Z]/, (match) => 
        `What if ${match.toLowerCase()}`
      )}?`;
      
      return [questionVersion, ...sentences.slice(1)].join(" ");
    }
    
    return tweet;
  }

  brandVoiceGuidelines(): string {
    return `
# Your Authentic Voice Guidelines

## ✅ DO Use:
- Personal experiences: "When I first learned..."
- Specific examples: "Take Sarah, who..."  
- Questions first: "What would happen if...?"
- Admitting uncertainty: "I could be wrong, but..."
- Conversational tone: "Here's the thing..."
- Discovery language: "Let's explore..."

## ❌ AVOID:
- Generic emojis: 🚀🔥💯
- Long dashes: ———————
- Corporate speak: "leverage", "optimize", "synergy"
- Prescriptive language: "You must", "You need to"
- Generic lists: "Here are 5 tips..."
- AI transitions: "Moving on...", "Additionally..."

## 🎯 Your Unique Elements:
- Orange → Yellow gradient visual identity
- Discovery-based questioning approach
- First-principles thinking methodology
- Accessibility-focused explanations
- Socratic teaching style
`;
  }
}

export const contentAuthenticityMentor = new ContentAuthenticityMentor();