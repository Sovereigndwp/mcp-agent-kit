import { BrandIdentitySystem, brandIdentitySystem } from './BrandIdentitySystem.js';
import { ContentAuthenticityMentor, contentAuthenticityMentor, AuthenticityAnalysis } from './ContentAuthenticityMentor.js';
import { PlatformStrategyMentor, platformStrategyMentor, PlatformAnalysis, PlatformComparison } from './PlatformStrategyMentor.js';

export interface ContentAnalysisReport {
  overall_score: number; // 0-100
  authenticity: AuthenticityAnalysis;
  platform_recommendations: PlatformComparison;
  brand_alignment: number; // 0-100
  improvement_priority: 'high' | 'medium' | 'low';
  action_items: string[];
  optimized_content?: string;
}

export interface PublishingStrategy {
  primary_platform: string;
  content_adaptations: Record<string, string>;
  posting_schedule: Record<string, string>;
  engagement_tactics: string[];
  success_metrics: string[];
}

export class ContentMentorOrchestrator {
  private brandSystem: BrandIdentitySystem;
  private authenticityMentor: ContentAuthenticityMentor;
  private platformMentor: PlatformStrategyMentor;

  constructor() {
    this.brandSystem = brandIdentitySystem;
    this.authenticityMentor = contentAuthenticityMentor;
    this.platformMentor = platformStrategyMentor;
  }

  analyzeContentForPublishing(content: string, contentType: 'tweet' | 'article' | 'video' | 'course'): ContentAnalysisReport {
    // Get comprehensive analysis from all mentors
    const authenticity = this.authenticityMentor.analyzeContent(content);
    const platformComparison = this.platformMentor.generatePlatformComparison();
    const brandGuidelines = this.brandSystem.getBrandGuidelines();

    // Calculate brand alignment based on voice consistency
    const brand_alignment = this.calculateBrandAlignment(content, brandGuidelines);
    
    // Calculate overall score
    const overall_score = (authenticity.authenticity_score + authenticity.brand_alignment + brand_alignment) / 3;
    
    // Determine improvement priority
    const improvement_priority = this.getPriorityLevel(overall_score);
    
    // Generate action items
    const action_items = this.generateActionItems(authenticity, brand_alignment, platformComparison);

    return {
      overall_score,
      authenticity,
      platform_recommendations: platformComparison,
      brand_alignment,
      improvement_priority,
      action_items,
      optimized_content: this.optimizeContent(content, authenticity, brandGuidelines)
    };
  }

  private calculateBrandAlignment(content: string, brandGuidelines: any): number {
    let score = 70; // Base score
    const contentLower = content.toLowerCase();

    // Check for brand voice alignment
    const positiveVoiceIndicators = [
      'what if', 'have you ever', 'think about', 'consider', 'discover',
      'let\'s explore', 'from first principles', 'in simple terms'
    ];

    const negativeVoiceIndicators = [
      'you must', 'you need to', 'obviously', 'simply', 'clearly',
      'leverage', 'optimize', 'synergy', 'utilize'
    ];

    // Positive alignment
    positiveVoiceIndicators.forEach(indicator => {
      if (contentLower.includes(indicator)) {
        score += 5;
      }
    });

    // Negative alignment  
    negativeVoiceIndicators.forEach(indicator => {
      if (contentLower.includes(indicator)) {
        score -= 8;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private getPriorityLevel(score: number): 'high' | 'medium' | 'low' {
    if (score < 60) return 'high';
    if (score < 80) return 'medium';
    return 'low';
  }

  private generateActionItems(authenticity: AuthenticityAnalysis, brandAlignment: number, platforms: PlatformComparison): string[] {
    const items: string[] = [];

    // Authenticity improvements
    if (authenticity.authenticity_score < 70) {
      items.push("🎯 CRITICAL: Replace AI-like patterns with personal experiences");
      items.push("✨ Add specific examples and stories from your teaching");
    }

    if (authenticity.ai_flags.length > 0) {
      items.push(`⚠️ Remove ${authenticity.ai_flags.length} AI-detected patterns`);
      items.push("🗣️ Rewrite with conversational, personal tone");
    }

    // Brand alignment improvements
    if (brandAlignment < 70) {
      items.push("🧠 Add more Socratic questioning approach");
      items.push("🔍 Include discovery-based language");
      items.push("📚 Align with first-principles teaching methodology");
    }

    // Platform-specific recommendations
    items.push(`📱 Optimize for ${platforms.primary_platform} first`);
    items.push(`🔄 Adapt for ${platforms.secondary_platforms.join(', ')}`);

    // Brand consistency
    const brandGuidelines = this.brandSystem.getBrandGuidelines();
    items.push("🎨 Use brand colors: orange-yellow gradient on black");
    items.push("💬 Maintain authentic educator voice");

    return items;
  }

  private optimizeContent(content: string, authenticity: AuthenticityAnalysis, brandGuidelines: any): string {
    let optimized = content;

    // Replace AI-like patterns
    if (authenticity.ai_flags.length > 0) {
      // Replace common AI patterns
      optimized = optimized.replace(/Here are the key takeaways:/gi, "What did I discover:");
      optimized = optimized.replace(/Let me break this down for you:/gi, "Think through this with me:");
      optimized = optimized.replace(/🚀🚀🚀/gi, "⚡");
      optimized = optimized.replace(/———+/gi, "");
      optimized = optimized.replace(/Here's what I learned —+/gi, "What I discovered:");
    }

    // Add brand voice elements
    if (authenticity.brand_alignment < 80) {
      // Add question-first approach if missing
      if (!optimized.includes('?') || optimized.indexOf('?') > 100) {
        const firstSentence = optimized.split('.')[0];
        optimized = `What if ${firstSentence.toLowerCase()}? ${optimized.substring(firstSentence.length + 1)}`;
      }

      // Add discovery language
      optimized = optimized.replace(/I will teach you/gi, "Let's discover together");
      optimized = optimized.replace(/You will learn/gi, "You'll discover");
    }

    return optimized;
  }

  generatePublishingStrategy(content: string, contentType: 'tweet' | 'article' | 'video' | 'course'): PublishingStrategy {
    const analysis = this.analyzeContentForPublishing(content, contentType);
    const platformRecommendations = analysis.platform_recommendations;
    
    // Get Bitcoin education specific recommendations
    const bitcoinStrategy = this.platformMentor.getBitcoinEducationRecommendation();
    
    const primary_platform = bitcoinStrategy.platform_priority[0];
    
    // Generate content adaptations for each platform
    const content_adaptations: Record<string, string> = {};
    
    if (contentType === 'tweet') {
      content_adaptations['twitter'] = this.adaptForTwitter(content, analysis);
      content_adaptations['substack'] = this.adaptForSubstack(content, analysis);
      content_adaptations['nostr'] = this.adaptForNostr(content, analysis);
    }

    // Generate posting schedule
    const posting_schedule = {
      twitter: "Daily (1-2 threads + engagement)",
      substack: "Weekly (Thursdays optimal)",
      nostr: "3-4 times per week",
      linkedin: "2-3 times per week"
    };

    // Generate engagement tactics
    const engagement_tactics = [
      "Reply to every comment within 2 hours",
      "Ask follow-up questions in responses",
      "Share personal teaching experiences",
      "Create polls about Bitcoin concepts",
      "Quote tweet with additional insights"
    ];

    // Generate success metrics
    const success_metrics = [
      `${primary_platform} engagement rate >5%`,
      "Course link clicks from social media",
      "Quality of discussions generated", 
      "New follower conversion to students",
      "Cross-platform traffic flow"
    ];

    return {
      primary_platform,
      content_adaptations,
      posting_schedule,
      engagement_tactics,
      success_metrics
    };
  }

  private adaptForTwitter(content: string, analysis: ContentAnalysisReport): string {
    let adapted = analysis.optimized_content || content;
    
    // Ensure Twitter-friendly format
    if (adapted.length > 280) {
      // Convert to thread format
      const sentences = adapted.split(/[.!?]\s+/);
      const threads = [];
      let currentThread = "🧵 ";
      
      sentences.forEach(sentence => {
        if ((currentThread + sentence + ". ").length < 270) {
          currentThread += sentence + ". ";
        } else {
          threads.push(currentThread.trim());
          currentThread = sentence + ". ";
        }
      });
      
      if (currentThread.trim().length > 0) {
        threads.push(currentThread.trim());
      }
      
      adapted = threads.join("\n\n");
    }

    // Add Twitter-specific brand elements
    adapted = adapted.replace(/🚀/gi, "⚡"); // Use our preferred emoji
    
    return adapted;
  }

  private adaptForSubstack(content: string, analysis: ContentAnalysisReport): string {
    let adapted = analysis.optimized_content || content;
    
    // Expand for long-form content
    adapted = `# ${this.extractTitle(adapted)}\n\n${adapted}`;
    
    // Add Substack-specific elements
    adapted += "\n\n---\n\n*What questions does this raise for you? Reply and let's explore together.*";
    
    return adapted;
  }

  private adaptForNostr(content: string, analysis: ContentAnalysisReport): string {
    let adapted = analysis.optimized_content || content;
    
    // Add Nostr-specific Bitcoin focus
    adapted = adapted.replace(/Bitcoin/gi, "₿itcoin");
    
    // Add Lightning tip encouragement
    adapted += "\n\n⚡ Found this helpful? Zap to support Bitcoin education";
    
    return adapted;
  }

  private extractTitle(content: string): string {
    const firstSentence = content.split(/[.!?]/)[0];
    return firstSentence.length < 60 ? firstSentence : firstSentence.substring(0, 57) + "...";
  }

  getComprehensiveContentReport(content: string): {
    analysis: ContentAnalysisReport;
    strategy: PublishingStrategy;
    brandGuidelines: string;
    recommendations: string[];
  } {
    const analysis = this.analyzeContentForPublishing(content, 'tweet');
    const strategy = this.generatePublishingStrategy(content, 'tweet');
    const brandGuidelines = this.authenticityMentor.brandVoiceGuidelines();
    
    const recommendations = [
      `Overall Content Score: ${Math.round(analysis.overall_score)}/100`,
      `Priority Level: ${analysis.improvement_priority.toUpperCase()}`,
      `Primary Platform: ${strategy.primary_platform}`,
      `Authenticity Score: ${Math.round(analysis.authenticity.authenticity_score)}/100`,
      `Brand Alignment: ${Math.round(analysis.brand_alignment)}/100`,
      "",
      "🎯 IMMEDIATE ACTION ITEMS:",
      ...analysis.action_items
    ];

    return {
      analysis,
      strategy,
      brandGuidelines,
      recommendations
    };
  }
}

export const contentMentorOrchestrator = new ContentMentorOrchestrator();