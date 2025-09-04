export interface PlatformAnalysis {
  platform: string;
  audience_fit: number; // 0-100
  content_format_match: number; // 0-100
  monetization_potential: number; // 0-100
  discoverability: number; // 0-100
  engagement_quality: number; // 0-100
  overall_score: number; // 0-100
  pros: string[];
  cons: string[];
  recommended_strategy: string;
  content_types: string[];
  posting_frequency: string;
  success_metrics: string[];
}

export interface PlatformComparison {
  primary_platform: string;
  secondary_platforms: string[];
  avoid_platforms: string[];
  cross_posting_strategy: string;
  resource_allocation: Record<string, number>; // Platform -> % of effort
}

export class PlatformStrategyMentor {
  private platforms: Record<string, any> = {
    twitter: {
      audience_characteristics: {
        bitcoin_presence: 95,
        educator_presence: 70,
        tech_savvy: 85,
        early_adopters: 90,
        age_range: "25-45",
        engagement_style: "rapid, discussion-based"
      },
      content_advantages: [
        "Thread format perfect for educational sequences",
        "Real-time engagement and discussion",
        "Bitcoin community very active",
        "Quote tweets enable commentary",
        "Lists and spaces for community building"
      ],
      monetization: {
        direct: 40, // Twitter monetization tools limited
        indirect: 95, // Driving traffic to courses excellent
        partnership: 85, // Collaboration opportunities high
        community: 90 // Building audience very effective
      },
      algorithm: {
        discovery: 80,
        engagement_reward: 85,
        educational_content: 75,
        consistency_importance: 90
      }
    },
    substack: {
      audience_characteristics: {
        bitcoin_presence: 70,
        educator_presence: 85,
        tech_savvy: 75,
        early_adopters: 70,
        age_range: "30-50",
        engagement_style: "deep, thoughtful"
      },
      content_advantages: [
        "Long-form educational content ideal",
        "Direct monetization through subscriptions",
        "Email list ownership",
        "Professional presentation",
        "Newsletter format builds loyalty"
      ],
      monetization: {
        direct: 95, // Excellent subscription model
        indirect: 70, // Less traffic driving
        partnership: 60, // Fewer collaboration tools
        community: 75 // Comments and discussion features
      },
      algorithm: {
        discovery: 60, // Lower organic reach
        engagement_reward: 70,
        educational_content: 95, // Perfect for education
        consistency_importance: 85
      }
    },
    nostr: {
      audience_characteristics: {
        bitcoin_presence: 98, // Highest Bitcoin concentration
        educator_presence: 45, // Newer platform, fewer educators
        tech_savvy: 95, // Very technical audience
        early_adopters: 100, // Ultimate early adopters
        age_range: "25-40",
        engagement_style: "philosophical, technical"
      },
      content_advantages: [
        "Censorship-resistant platform",
        "Bitcoin-native audience",
        "Direct Bitcoin payments (Lightning)",
        "No algorithm manipulation",
        "Authentic, unfiltered discussions"
      ],
      monetization: {
        direct: 85, // Lightning payments integration
        indirect: 60, // Smaller audience size
        partnership: 70, // Growing collaboration opportunities
        community: 95 // Very tight-knit community
      },
      algorithm: {
        discovery: 70, // Chronological feeds
        engagement_reward: 60, // No algorithmic boost
        educational_content: 80, // Appreciated but smaller audience
        consistency_importance: 75
      }
    },
    linkedin: {
      audience_characteristics: {
        bitcoin_presence: 40,
        educator_presence: 90,
        tech_savvy: 65,
        early_adopters: 50,
        age_range: "28-55",
        engagement_style: "professional, networking"
      },
      content_advantages: [
        "Professional credibility building",
        "B2B networking for corporate training",
        "Long-form articles supported",
        "Educational content highly valued",
        "Less noise, more focused engagement"
      ],
      monetization: {
        direct: 30, // Limited direct monetization
        indirect: 85, // Great for driving premium services
        partnership: 95, // Excellent for B2B partnerships
        community: 70 // Professional networking
      },
      algorithm: {
        discovery: 75,
        engagement_reward: 80,
        educational_content: 90, // Highly favored
        consistency_importance: 85
      }
    },
    youtube: {
      audience_characteristics: {
        bitcoin_presence: 80,
        educator_presence: 85,
        tech_savvy: 70,
        early_adopters: 65,
        age_range: "20-50",
        engagement_style: "visual, tutorial-focused"
      },
      content_advantages: [
        "Visual/interactive content perfect for Bitcoin education",
        "Long-form educational videos",
        "Searchable content library",
        "Multiple monetization options",
        "Community features (comments, live chat)"
      ],
      monetization: {
        direct: 85, // Ad revenue, memberships, Super Chat
        indirect: 80, // Great for course promotion
        partnership: 90, // Sponsor opportunities
        community: 85 // Strong community features
      },
      algorithm: {
        discovery: 95, // Excellent search and recommendation
        engagement_reward: 90, // Highly engagement-driven
        educational_content: 85, // Educational content favored
        consistency_importance: 95 // Critical for YouTube success
      }
    }
  };

  analyzePlatform(platform: string): PlatformAnalysis {
    const data = this.platforms[platform];
    if (!data) {
      throw new Error(`Platform ${platform} not found in analysis database`);
    }

    const audience_fit = (data.audience_characteristics.bitcoin_presence + 
                         data.audience_characteristics.educator_presence) / 2;
    
    const content_format_match = this.calculateContentMatch(platform);
    const monetization_potential = this.calculateMonetization(data.monetization);
    const discoverability = data.algorithm.discovery;
    const engagement_quality = data.algorithm.engagement_reward;
    
    const overall_score = (audience_fit + content_format_match + monetization_potential + 
                          discoverability + engagement_quality) / 5;

    return {
      platform,
      audience_fit,
      content_format_match,
      monetization_potential,
      discoverability,
      engagement_quality,
      overall_score,
      pros: data.content_advantages,
      cons: this.getConsolidatedCons(platform),
      recommended_strategy: this.getStrategy(platform, overall_score),
      content_types: this.getContentTypes(platform),
      posting_frequency: this.getPostingFrequency(platform),
      success_metrics: this.getSuccessMetrics(platform)
    };
  }

  private calculateContentMatch(platform: string): number {
    const educationScores: Record<string, number> = {
      twitter: 85, // Threads perfect for education
      substack: 95, // Ideal for long-form education
      nostr: 75, // Good but smaller audience
      linkedin: 90, // Professional education highly valued
      youtube: 90 // Visual education perfect
    };
    
    return educationScores[platform] || 50;
  }

  private calculateMonetization(monetization: any): number {
    return (monetization.direct + monetization.indirect + 
            monetization.partnership + monetization.community) / 4;
  }

  private getConsolidatedCons(platform: string): string[] {
    const cons: Record<string, string[]> = {
      twitter: [
        "High noise-to-signal ratio",
        "Character limits restrict depth",
        "Algorithm changes frequently",
        "Toxicity can be high",
        "Direct monetization limited"
      ],
      substack: [
        "Smaller audience reach",
        "Slower growth initially",
        "Less social interaction",
        "Discovery challenging",
        "Subscription fatigue among users"
      ],
      nostr: [
        "Very small audience currently",
        "Technical barriers for mainstream users",
        "Limited discovery mechanisms",
        "Fewer educational creators",
        "Platform still maturing"
      ],
      linkedin: [
        "Limited Bitcoin audience",
        "Professional constraints on content style",
        "Algorithm favors corporate content",
        "Less viral potential",
        "Slower engagement cycles"
      ],
      youtube: [
        "High production time requirements",
        "Very competitive space",
        "Algorithm heavily favors consistency",
        "Significant time investment",
        "SEO optimization required"
      ]
    };
    
    return cons[platform] || [];
  }

  private getStrategy(platform: string, score: number): string {
    const strategies: Record<string, string> = {
      twitter: score > 80 ? "Primary platform: Daily threads, heavy engagement, community building" :
               score > 60 ? "Secondary platform: 3-4 tweets/week, selective engagement" :
               "Minimal presence: Cross-post only",
      
      substack: score > 80 ? "Primary long-form: Weekly newsletters, course integration" :
                score > 60 ? "Secondary content: Bi-weekly deep dives" :
                "Not recommended for your content style",
      
      nostr: score > 70 ? "Early adopter advantage: Regular posting, Lightning integration" :
             score > 50 ? "Experimental presence: Weekly posts, community observation" :
             "Wait until platform matures",
      
      linkedin: score > 75 ? "B2B focus: Weekly articles, corporate outreach" :
                score > 50 ? "Professional credibility: Monthly thought leadership" :
                "Minimal professional presence only",
      
      youtube: score > 85 ? "Major commitment: Weekly videos, full production" :
               score > 70 ? "Strategic content: Monthly high-value videos" :
               "Consider starting with shorts/simple content"
    };
    
    return strategies[platform] || "Platform not recommended";
  }

  private getContentTypes(platform: string): string[] {
    const contentTypes: Record<string, string[]> = {
      twitter: [
        "Educational threads (8-12 tweets)",
        "Discovery question starters",
        "Student success stories",
        "Quick Bitcoin insights",
        "Live commentary on Bitcoin news"
      ],
      substack: [
        "Long-form educational essays",
        "Course module deep-dives",
        "Student case studies",
        "Philosophy of education pieces",
        "Bitcoin analysis and commentary"
      ],
      nostr: [
        "First-principles Bitcoin discussions",
        "Technical deep-dives",
        "Philosophy and sovereignty content",
        "Lightning payment experiments",
        "Uncensored Bitcoin education"
      ],
      linkedin: [
        "Professional education articles",
        "Corporate Bitcoin adoption insights",
        "Educational methodology posts",
        "B2B partnership announcements",
        "Industry credibility content"
      ],
      youtube: [
        "Interactive Bitcoin tutorials",
        "Screen-recorded course walkthroughs",
        "Student interview series",
        "Bitcoin concept explanations",
        "Educational methodology discussions"
      ]
    };
    
    return contentTypes[platform] || [];
  }

  private getPostingFrequency(platform: string): string {
    const frequencies: Record<string, string> = {
      twitter: "Daily (1-2 threads + engagement)",
      substack: "Weekly (Thursdays optimal)",
      nostr: "3-4 times per week",
      linkedin: "2-3 times per week",
      youtube: "Weekly (Tuesdays/Thursdays optimal)"
    };
    
    return frequencies[platform] || "Platform-dependent";
  }

  private getSuccessMetrics(platform: string): string[] {
    const metrics: Record<string, string[]> = {
      twitter: [
        "Thread engagement rate (>5%)",
        "Profile visits from tweets",
        "Course link clicks",
        "Follower growth rate",
        "Quality of replies/discussions"
      ],
      substack: [
        "Subscriber growth rate",
        "Open rate (>40%)",
        "Click-through rate to courses",
        "Paid conversion rate",
        "Newsletter engagement"
      ],
      nostr: [
        "Zap (Lightning tip) volume",
        "Note engagement",
        "Follower quality over quantity",
        "Community building metrics",
        "Direct course sales"
      ],
      linkedin: [
        "Article view count",
        "Professional connection requests",
        "B2B inquiry generation",
        "Corporate training leads",
        "Industry recognition"
      ],
      youtube: [
        "Video watch time/retention",
        "Subscriber growth",
        "Course traffic from videos",
        "Comment engagement quality",
        "Search ranking for Bitcoin education"
      ]
    };
    
    return metrics[platform] || [];
  }

  generatePlatformComparison(): PlatformComparison {
    const analyses = Object.keys(this.platforms).map(platform => {
      const analysis = this.analyzePlatform(platform);
      return {
        platform,
        ...analysis
      };
    });

    // Sort by overall score
    analyses.sort((a, b) => b.overall_score - a.overall_score);

    const primary = analyses[0].platform;
    const secondary = analyses.slice(1, 3).map(a => a.platform);
    const avoid = analyses.filter(a => a.overall_score < 60).map(a => a.platform);

    return {
      primary_platform: primary,
      secondary_platforms: secondary,
      avoid_platforms: avoid,
      cross_posting_strategy: this.generateCrossPostingStrategy(primary, secondary),
      resource_allocation: this.generateResourceAllocation(primary, secondary)
    };
  }

  private generateCrossPostingStrategy(primary: string, secondary: string[]): string {
    return `
Primary (${primary}): Create original content here first, engage heavily
Secondary (${secondary.join(', ')}): Adapt primary content for each platform's format
Cross-posting: 
- Same core message, different presentation
- Platform-specific calls to action
- Native engagement on each platform
- Link back to primary platform for deeper engagement
`;
  }

  private generateResourceAllocation(primary: string, secondary: string[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    const secondaryCount = secondary.length;
    
    allocation[primary] = 60;
    secondary.forEach(platform => {
      allocation[platform] = 40 / secondaryCount;
    });
    
    return allocation;
  }

  // Specific analysis for Bitcoin education
  getBitcoinEducationRecommendation(): {
    recommended_strategy: string;
    platform_priority: string[];
    reasoning: string;
  } {
    return {
      recommended_strategy: `
🎯 RECOMMENDED STRATEGY FOR BITCOIN EDUCATION:

1. PRIMARY: Twitter (80% effort)
   - Highest Bitcoin audience concentration
   - Thread format perfect for educational sequences
   - Real-time engagement and community building
   - Best for building initial audience

2. SECONDARY: Substack (15% effort) 
   - Long-form content for serious students
   - Direct monetization through subscriptions
   - Email list ownership
   - Professional credibility

3. EXPERIMENTAL: Nostr (5% effort)
   - Most Bitcoin-native audience
   - Lightning payment integration
   - Early adopter advantage
   - Authentic, uncensored discussions

AVOID FOR NOW: LinkedIn (limited Bitcoin audience), YouTube (too time-intensive initially)
`,
      platform_priority: ['twitter', 'substack', 'nostr'],
      reasoning: `
Bitcoin education specifically benefits from:
1. High Bitcoin audience concentration (Twitter/Nostr excel)
2. Thread/sequential content format (Twitter perfect)
3. Direct monetization options (Substack ideal)
4. Real-time discussion and engagement (Twitter superior)
5. Technical audience that appreciates depth (Nostr emerging)

Your discovery-based teaching style works best with:
- Interactive Q&A formats (Twitter threads)
- Sequential learning paths (Twitter/Substack)
- Community discussion (Twitter/Nostr)
- Professional long-form content (Substack)
`
    };
  }
}

export const platformStrategyMentor = new PlatformStrategyMentor();