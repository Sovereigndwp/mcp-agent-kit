import { LearningPathOptimizer } from './agents/LearningPathOptimizer';
import { BrandStyleLearningAgent } from './agents/BrandStyleLearningAgent';
import { ContentAccuracyValidator } from './agents/ContentAccuracyValidator';
import { FinancialLiteracyBridge } from './agents/FinancialLiteracyBridge';

export interface QuestionnaireResponse {
  // Section 1: Personal Background & Goals
  primaryMotivations: string[];
  financialBackground: string;
  timeCommitment: string;
  learningStyles: string[];

  // Section 2: Technical Background
  technologyComfort: {
    basicComputing: number;
    internetSecurity: number;
    mobileApps: number;
    financialSoftware: number;
    commandLine: number;
  };
  programmingExperience: string;
  cryptographyKnowledge: string;

  // Section 3: Bitcoin-Specific
  bitcoinKnowledge: string;
  bitcoinExperience: string[];
  topicInterests: string[];

  // Section 4: Learning Preferences
  learningChallenges: string[];
  feedbackPreferences: string[];
  learningEnvironment: string[];

  // Section 5: Goals & Success
  primaryGoal: string;
  successDefinition: string[];
  timeline: string;
}

export interface PersonalizedCourseRecommendation {
  learningPath: string;
  pathDescription: string;
  estimatedDuration: string;
  difficultyLevel: string;
  customizedCurriculum: ModuleRecommendation[];
  personalizedFeatures: PersonalizationSettings;
  mentorshipRecommendations: string[];
  communityConnections: string[];
  progressTrackingPlan: ProgressPlan;
  successMetrics: string[];
}

export interface ModuleRecommendation {
  moduleId: string;
  moduleName: string;
  priority: 'high' | 'medium' | 'low';
  prerequisitesMet: boolean;
  customizations: string[];
  estimatedTime: string;
  learningObjectives: string[];
  assessmentMethods: string[];
}

export interface PersonalizationSettings {
  contentDeliveryStyle: string;
  interactionLevel: string;
  gamificationLevel: string;
  socialLearningLevel: string;
  practicalApplicationEmphasis: string;
  supportLevel: string;
}

export interface ProgressPlan {
  milestones: string[];
  checkpointFrequency: string;
  adaptationTriggers: string[];
  interventionStrategies: string[];
  celebrationMoments: string[];
}

export class QuestionnaireProcessor {
  private pathOptimizer: LearningPathOptimizer;
  private brandAgent: BrandStyleLearningAgent;
  private accuracyValidator: ContentAccuracyValidator;
  private financialBridge: FinancialLiteracyBridge;

  constructor() {
    this.pathOptimizer = new LearningPathOptimizer();
    this.brandAgent = new BrandStyleLearningAgent();
    this.accuracyValidator = new ContentAccuracyValidator();
    this.financialBridge = new FinancialLiteracyBridge();
  }

  async processQuestionnaire(responses: QuestionnaireResponse): Promise<PersonalizedCourseRecommendation> {
    // Step 1: Analyze learner profile
    const learnerProfile = this.analyzeLearnerProfile(responses);

    // Step 2: Determine optimal learning path
    const recommendedPath = this.determineLearningPath(responses);

    // Step 3: Create customized curriculum
    const customizedCurriculum = await this.createCustomizedCurriculum(responses, recommendedPath);

    // Step 4: Configure personalization settings
    const personalizationSettings = this.configurePersonalization(responses);

    // Step 5: Create progress tracking plan
    const progressPlan = this.createProgressPlan(responses, recommendedPath);

    // Step 6: Generate mentorship and community recommendations
    const mentorshipRecommendations = this.generateMentorshipRecommendations(responses);
    const communityConnections = this.generateCommunityConnections(responses);

    // Step 7: Define success metrics
    const successMetrics = this.defineSuccessMetrics(responses);

    return {
      learningPath: recommendedPath.name,
      pathDescription: recommendedPath.description,
      estimatedDuration: this.calculateEstimatedDuration(responses, recommendedPath),
      difficultyLevel: this.determineDifficultyLevel(responses),
      customizedCurriculum,
      personalizedFeatures: personalizationSettings,
      mentorshipRecommendations,
      communityConnections,
      progressTrackingPlan: progressPlan,
      successMetrics
    };
  }

  private analyzeLearnerProfile(responses: QuestionnaireResponse): any {
    return {
      technicalLevel: this.calculateTechnicalLevel(responses.technologyComfort, responses.programmingExperience),
      bitcoinLevel: this.mapBitcoinKnowledge(responses.bitcoinKnowledge),
      financialLevel: this.mapFinancialBackground(responses.financialBackground),
      motivationProfile: this.analyzeMotivations(responses.primaryMotivations),
      learningStyleProfile: this.analyzeLearningStyles(responses.learningStyles),
      timeCapacity: this.mapTimeCommitment(responses.timeCommitment),
      goalOrientation: this.analyzeGoalOrientation(responses.primaryGoal)
    };
  }

  private determineLearningPath(responses: QuestionnaireResponse): any {
    const pathScores = {
      sovereigntySeeker: 0,
      technicalBuilder: 0,
      investmentProfessional: 0,
      educatorAdvocate: 0,
      businessInnovator: 0
    };

    // Score based on primary motivations
    responses.primaryMotivations.forEach(motivation => {
      switch (motivation) {
        case 'Personal financial sovereignty':
        case 'Privacy and freedom concerns':
          pathScores.sovereigntySeeker += 3;
          break;
        case 'Technical curiosity and development':
        case 'Building Bitcoin-related products/services':
          pathScores.technicalBuilder += 3;
          break;
        case 'Investment and wealth preservation':
          pathScores.investmentProfessional += 3;
          break;
        case 'Teaching others about Bitcoin':
          pathScores.educatorAdvocate += 3;
          break;
        case 'Professional/career development':
          pathScores.businessInnovator += 2;
          pathScores.technicalBuilder += 1;
          break;
      }
    });

    // Score based on primary goal
    switch (responses.primaryGoal) {
      case 'Personal Sovereignty':
        pathScores.sovereigntySeeker += 5;
        break;
      case 'Technical Mastery':
        pathScores.technicalBuilder += 5;
        break;
      case 'Investment Proficiency':
        pathScores.investmentProfessional += 5;
        break;
      case 'Educational Leadership':
        pathScores.educatorAdvocate += 5;
        break;
      case 'Business Innovation':
        pathScores.businessInnovator += 5;
        break;
      case 'Professional Expertise':
        pathScores.technicalBuilder += 3;
        pathScores.investmentProfessional += 2;
        break;
    }

    // Score based on technical background
    const avgTechComfort = Object.values(responses.technologyComfort).reduce((a, b) => a + b, 0) / 5;
    if (avgTechComfort >= 4) {
      pathScores.technicalBuilder += 2;
    }
    if (responses.programmingExperience === 'Advanced' || responses.programmingExperience === 'Expert') {
      pathScores.technicalBuilder += 3;
    }

    // Score based on financial background
    if (responses.financialBackground === 'Advanced' || responses.financialBackground === 'Expert') {
      pathScores.investmentProfessional += 2;
    }

    // Score based on topic interests
    responses.topicInterests.forEach(interest => {
      switch (interest) {
        case 'Self-custody and hardware wallets':
        case 'Privacy and security practices':
          pathScores.sovereigntySeeker += 2;
          break;
        case 'Technical architecture and development':
        case 'Building on Bitcoin (development)':
          pathScores.technicalBuilder += 2;
          break;
        case 'Investment and trading strategies':
          pathScores.investmentProfessional += 2;
          break;
        case 'Teaching and spreading Bitcoin adoption':
          pathScores.educatorAdvocate += 2;
          break;
        case 'Bitcoin\'s role in global finance':
          pathScores.businessInnovator += 2;
          break;
      }
    });

    // Determine the highest scoring path
    const topPath = Object.entries(pathScores).reduce((a, b) =>
      pathScores[a[0]] > pathScores[b[0]] ? a : b
    );

    return this.getPathDetails(topPath[0]);
  }

  private getPathDetails(pathKey: string): any {
    const pathDetails = {
      sovereigntySeeker: {
        name: 'The Sovereignty Seeker',
        description: 'Master personal financial independence through Bitcoin self-custody, privacy, and sovereignty practices',
        focus: ['self-custody', 'privacy', 'security', 'node-operation'],
        phases: ['Foundation', 'Self-Custody Mastery', 'Advanced Sovereignty', 'Sovereignty Mastery']
      },
      technicalBuilder: {
        name: 'The Technical Builder',
        description: 'Develop deep technical expertise in Bitcoin protocol, development, and infrastructure',
        focus: ['protocol-development', 'lightning-network', 'cryptography', 'node-operation'],
        phases: ['Technical Foundations', 'Development Skills', 'Advanced Development', 'Bitcoin Innovation']
      },
      investmentProfessional: {
        name: 'The Investment Professional',
        description: 'Master Bitcoin as an investment asset with professional-grade analysis and portfolio management',
        focus: ['investment-analysis', 'portfolio-management', 'market-dynamics', 'risk-management'],
        phases: ['Investment Foundations', 'Advanced Investing', 'Professional Practice', 'Investment Leadership']
      },
      educatorAdvocate: {
        name: 'The Educator & Advocate',
        description: 'Become a Bitcoin education leader capable of teaching and spreading Bitcoin knowledge effectively',
        focus: ['comprehensive-knowledge', 'teaching-skills', 'content-creation', 'community-building'],
        phases: ['Comprehensive Foundation', 'Teaching Mastery', 'Content Creation', 'Educational Leadership']
      },
      businessInnovator: {
        name: 'The Business Innovator',
        description: 'Lead Bitcoin integration and innovation in business contexts and organizational adoption',
        focus: ['business-integration', 'product-development', 'organizational-adoption', 'innovation-leadership'],
        phases: ['Bitcoin Business Fundamentals', 'Product Integration', 'Innovation Leadership', 'Industry Leadership']
      }
    };

    return pathDetails[pathKey];
  }

  private async createCustomizedCurriculum(
    responses: QuestionnaireResponse,
    path: any
  ): Promise<ModuleRecommendation[]> {
    const baseModules = this.getBaseModules();
    const pathSpecificModules = this.getPathSpecificModules(path.name);

    // Combine and customize modules based on learner profile
    const allModules = [...baseModules, ...pathSpecificModules];

    return allModules.map(module => ({
      moduleId: module.id,
      moduleName: module.name,
      priority: this.calculateModulePriority(module, responses, path),
      prerequisitesMet: this.checkPrerequisites(module, responses),
      customizations: this.generateModuleCustomizations(module, responses),
      estimatedTime: this.calculateModuleTime(module, responses),
      learningObjectives: this.customizeLearningObjectives(module, responses),
      assessmentMethods: this.selectAssessmentMethods(module, responses)
    }));
  }

  private getBaseModules(): any[] {
    return [
      { id: 'bitcoin-origins', name: 'Bitcoin Origins & Philosophy', difficulty: 'beginner', duration: 8 },
      { id: 'technical-foundations', name: 'Technical Foundations', difficulty: 'intermediate', duration: 12 },
      { id: 'using-bitcoin', name: 'Using Bitcoin', difficulty: 'beginner', duration: 6 },
      { id: 'bitcoin-network', name: 'The Bitcoin Network', difficulty: 'intermediate', duration: 10 },
      { id: 'economic-implications', name: 'Economic Implications', difficulty: 'intermediate', duration: 8 }
    ];
  }

  private getPathSpecificModules(pathName: string): any[] {
    const pathModules = {
      'The Sovereignty Seeker': [
        { id: 'custody-security', name: 'Custody & Security', difficulty: 'intermediate', duration: 15 },
        { id: 'privacy-fungibility', name: 'Privacy & Fungibility', difficulty: 'advanced', duration: 12 },
        { id: 'lightning-network', name: 'Lightning Network & Scaling', difficulty: 'advanced', duration: 10 },
        { id: 'node-operation', name: 'Node Operation', difficulty: 'intermediate', duration: 8 }
      ],
      'The Technical Builder': [
        { id: 'development-programming', name: 'Development & Programming', difficulty: 'advanced', duration: 20 },
        { id: 'lightning-development', name: 'Lightning Development', difficulty: 'advanced', duration: 15 },
        { id: 'protocol-development', name: 'Protocol Development', difficulty: 'expert', duration: 25 },
        { id: 'cryptography-deep', name: 'Advanced Cryptography', difficulty: 'expert', duration: 18 }
      ],
      'The Investment Professional': [
        { id: 'investment-trading', name: 'Investment & Trading', difficulty: 'intermediate', duration: 15 },
        { id: 'portfolio-management', name: 'Portfolio Management', difficulty: 'advanced', duration: 12 },
        { id: 'market-analysis', name: 'Market Analysis', difficulty: 'advanced', duration: 10 },
        { id: 'institutional-adoption', name: 'Institutional Adoption', difficulty: 'intermediate', duration: 8 }
      ],
      'The Educator & Advocate': [
        { id: 'teaching-methodology', name: 'Teaching Methodology', difficulty: 'intermediate', duration: 12 },
        { id: 'content-creation', name: 'Content Creation', difficulty: 'intermediate', duration: 15 },
        { id: 'community-building', name: 'Community Building', difficulty: 'intermediate', duration: 10 },
        { id: 'misconception-handling', name: 'Misconception Handling', difficulty: 'advanced', duration: 8 }
      ],
      'The Business Innovator': [
        { id: 'business-integration', name: 'Business Integration', difficulty: 'intermediate', duration: 12 },
        { id: 'product-development', name: 'Product Development', difficulty: 'advanced', duration: 18 },
        { id: 'regulatory-compliance', name: 'Regulatory Compliance', difficulty: 'advanced', duration: 10 },
        { id: 'organizational-adoption', name: 'Organizational Adoption', difficulty: 'intermediate', duration: 8 }
      ]
    };

    return pathModules[pathName] || [];
  }

  private configurePersonalization(responses: QuestionnaireResponse): PersonalizationSettings {
    return {
      contentDeliveryStyle: this.determineContentDeliveryStyle(responses.learningStyles),
      interactionLevel: this.determineInteractionLevel(responses.feedbackPreferences),
      gamificationLevel: this.determineGamificationLevel(responses.learningEnvironment),
      socialLearningLevel: this.determineSocialLearningLevel(responses.learningStyles, responses.learningEnvironment),
      practicalApplicationEmphasis: this.determinePracticalEmphasis(responses.primaryMotivations, responses.bitcoinExperience),
      supportLevel: this.determineSupportLevel(responses.learningChallenges)
    };
  }

  private createProgressPlan(responses: QuestionnaireResponse, path: any): ProgressPlan {
    return {
      milestones: this.defineMilestones(path, responses.timeline),
      checkpointFrequency: this.determineCheckpointFrequency(responses.timeCommitment),
      adaptationTriggers: this.defineAdaptationTriggers(responses.learningChallenges),
      interventionStrategies: this.defineInterventionStrategies(responses.feedbackPreferences),
      celebrationMoments: this.defineCelebrationMoments(responses.learningEnvironment)
    };
  }

  private generateMentorshipRecommendations(responses: QuestionnaireResponse): string[] {
    const recommendations = [];

    if (responses.feedbackPreferences.includes('One-on-one expert guidance')) {
      recommendations.push('Weekly one-on-one mentor sessions');
    }

    if (responses.learningChallenges.includes('No one to ask questions')) {
      recommendations.push('Assign dedicated learning mentor');
    }

    if (responses.bitcoinKnowledge === 'Complete beginner') {
      recommendations.push('Beginner-friendly mentor with patience and clear explanations');
    }

    if (responses.primaryMotivations.includes('Technical curiosity and development')) {
      recommendations.push('Technical mentor with development experience');
    }

    return recommendations.length > 0 ? recommendations : ['Self-paced learning with community support'];
  }

  private generateCommunityConnections(responses: QuestionnaireResponse): string[] {
    const connections = [];

    if (responses.learningStyles.includes('Discussion with peers and experts')) {
      connections.push('Active discussion forums for your learning path');
    }

    if (responses.learningEnvironment.includes('Collaborative with group projects and discussions')) {
      connections.push('Study groups and collaborative projects');
    }

    if (responses.primaryGoal === 'Educational Leadership') {
      connections.push('Bitcoin educator community and teaching practice groups');
    }

    if (responses.timeCommitment === '10+ hours per week (Intensive Study)') {
      connections.push('Intensive learner cohort for peer motivation');
    }

    return connections;
  }

  private defineSuccessMetrics(responses: QuestionnaireResponse): string[] {
    const metrics = [];

    responses.successDefinition.forEach(definition => {
      switch (definition) {
        case 'Successfully manage my own Bitcoin with confidence':
          metrics.push('Complete self-custody setup and transaction proficiency assessment');
          break;
        case 'Earn Bitcoin-related professional credentials':
          metrics.push('Achieve professional Bitcoin certification');
          break;
        case 'Build and deploy a Bitcoin application':
          metrics.push('Complete and deploy functional Bitcoin application project');
          break;
        case 'Develop a successful Bitcoin investment strategy':
          metrics.push('Create and back-test investment strategy with documented results');
          break;
        case 'Teach Bitcoin to others effectively':
          metrics.push('Successfully mentor and educate other Bitcoin learners');
          break;
        case 'Launch a Bitcoin-integrated business':
          metrics.push('Launch business with integrated Bitcoin functionality');
          break;
      }
    });

    return metrics;
  }

  // Helper methods for calculations
  private calculateTechnicalLevel(comfort: any, programming: string): string {
    const avgComfort = Object.values(comfort).reduce((a: number, b: number) => a + b, 0) / 5;

    if (avgComfort >= 4.5 && (programming === 'Advanced' || programming === 'Expert')) {
      return 'expert';
    } else if (avgComfort >= 3.5 && programming !== 'No programming experience') {
      return 'advanced';
    } else if (avgComfort >= 2.5) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  private mapBitcoinKnowledge(knowledge: string): string {
    const mappings = {
      'Complete beginner': 'beginner',
      'Basic': 'basic',
      'Intermediate': 'intermediate',
      'Advanced': 'advanced',
      'Expert': 'expert'
    };
    return mappings[knowledge] || 'beginner';
  }

  private mapFinancialBackground(background: string): string {
    const mappings = {
      'Complete beginner': 'novice',
      'Basic': 'basic',
      'Intermediate': 'intermediate',
      'Advanced': 'advanced',
      'Expert': 'expert'
    };
    return mappings[background] || 'basic';
  }

  private analyzeMotivations(motivations: string[]): any {
    return {
      primary: motivations[0],
      intrinsicMotivation: motivations.some(m =>
        ['Personal financial sovereignty', 'Privacy and freedom concerns', 'Understanding the future of money'].includes(m)
      ),
      extrinsicMotivation: motivations.some(m =>
        ['Professional/career development', 'Investment and wealth preservation'].includes(m)
      ),
      socialMotivation: motivations.some(m =>
        ['Teaching others about Bitcoin'].includes(m)
      )
    };
  }

  private analyzeLearningStyles(styles: string[]): any {
    return {
      visual: styles.includes('Watching videos and visual content'),
      kinesthetic: styles.includes('Hands-on practice and experiments'),
      social: styles.includes('Discussion with peers and experts'),
      independent: styles.includes('Self-directed exploration'),
      structured: styles.includes('Structured courses with assessments')
    };
  }

  private mapTimeCommitment(commitment: string): string {
    const mappings = {
      '1-2 hours per week': 'casual',
      '3-5 hours per week': 'regular',
      '6-10 hours per week': 'dedicated',
      '10+ hours per week': 'intensive',
      'Variable': 'flexible'
    };
    return mappings[commitment] || 'regular';
  }

  private analyzeGoalOrientation(goal: string): string {
    const orientations = {
      'Personal Sovereignty': 'autonomy-focused',
      'Technical Mastery': 'mastery-focused',
      'Investment Proficiency': 'performance-focused',
      'Educational Leadership': 'purpose-focused',
      'Business Innovation': 'innovation-focused',
      'Professional Expertise': 'competency-focused'
    };
    return orientations[goal] || 'general';
  }

  private calculateEstimatedDuration(responses: QuestionnaireResponse, path: any): string {
    const baseHours = {
      'casual': 1.5,
      'regular': 4,
      'dedicated': 8,
      'intensive': 12
    };

    const timeCapacity = this.mapTimeCommitment(responses.timeCommitment);
    const weeklyHours = baseHours[timeCapacity] || 4;

    // Estimate total hours needed based on path complexity
    const pathComplexityHours = {
      'The Sovereignty Seeker': 120,
      'The Technical Builder': 180,
      'The Investment Professional': 100,
      'The Educator & Advocate': 140,
      'The Business Innovator': 110
    };

    const totalHours = pathComplexityHours[path.name] || 120;
    const weeks = Math.ceil(totalHours / weeklyHours);
    const months = Math.ceil(weeks / 4.3);

    return `${weeks} weeks (${months} months)`;
  }

  private determineDifficultyLevel(responses: QuestionnaireResponse): string {
    const techLevel = this.calculateTechnicalLevel(responses.technologyComfort, responses.programmingExperience);
    const bitcoinLevel = this.mapBitcoinKnowledge(responses.bitcoinKnowledge);

    if (techLevel === 'expert' && (bitcoinLevel === 'advanced' || bitcoinLevel === 'expert')) {
      return 'advanced';
    } else if (techLevel === 'advanced' || bitcoinLevel === 'intermediate') {
      return 'intermediate';
    } else {
      return 'beginner-friendly';
    }
  }

  private calculateModulePriority(module: any, responses: QuestionnaireResponse, path: any): 'high' | 'medium' | 'low' {
    // Base modules are always high priority
    if (['bitcoin-origins', 'technical-foundations', 'using-bitcoin'].includes(module.id)) {
      return 'high';
    }

    // Path-specific modules get priority based on interests
    if (responses.topicInterests.some(interest => module.name.toLowerCase().includes(interest.toLowerCase().split(' ')[0]))) {
      return 'high';
    }

    // Advanced modules get lower priority for beginners
    if (module.difficulty === 'expert' && responses.bitcoinKnowledge === 'Complete beginner') {
      return 'low';
    }

    return 'medium';
  }

  private checkPrerequisites(module: any, responses: QuestionnaireResponse): boolean {
    // Simplified prerequisite checking
    if (module.difficulty === 'expert') {
      return responses.bitcoinKnowledge !== 'Complete beginner';
    }
    if (module.difficulty === 'advanced') {
      return !['Complete beginner', 'Basic'].includes(responses.bitcoinKnowledge);
    }
    return true;
  }

  private generateModuleCustomizations(module: any, responses: QuestionnaireResponse): string[] {
    const customizations = [];

    if (responses.learningStyles.includes('Hands-on practice and experiments')) {
      customizations.push('Enhanced practical exercises');
    }

    if (responses.learningStyles.includes('Watching videos and visual content')) {
      customizations.push('Video-rich content delivery');
    }

    if (responses.feedbackPreferences.includes('Immediate automated feedback')) {
      customizations.push('Real-time progress feedback');
    }

    return customizations;
  }

  private calculateModuleTime(module: any, responses: QuestionnaireResponse): string {
    let baseTime = module.duration || 8;

    // Adjust based on prior knowledge
    if (responses.bitcoinKnowledge === 'Complete beginner') {
      baseTime *= 1.3;
    } else if (responses.bitcoinKnowledge === 'Advanced' || responses.bitcoinKnowledge === 'Expert') {
      baseTime *= 0.7;
    }

    return `${Math.round(baseTime)} hours`;
  }

  private customizeLearningObjectives(module: any, responses: QuestionnaireResponse): string[] {
    // This would normally be much more sophisticated
    return [
      `Understand core ${module.name} concepts`,
      `Apply ${module.name} knowledge practically`,
      `Explain ${module.name} to others confidently`
    ];
  }

  private selectAssessmentMethods(module: any, responses: QuestionnaireResponse): string[] {
    const methods = [];

    if (responses.learningStyles.includes('Hands-on practice and experiments')) {
      methods.push('Practical project assessment');
    }

    if (responses.learningEnvironment.includes('Structured with clear milestones and deadlines')) {
      methods.push('Formal knowledge assessment');
    }

    if (responses.primaryGoal === 'Educational Leadership') {
      methods.push('Teach-back assessment');
    }

    return methods.length > 0 ? methods : ['Knowledge check quiz', 'Practical application'];
  }

  // Personalization helper methods
  private determineContentDeliveryStyle(learningStyles: string[]): string {
    if (learningStyles.includes('Watching videos and visual content')) {
      return 'video-rich';
    } else if (learningStyles.includes('Reading comprehensive materials')) {
      return 'text-heavy';
    } else if (learningStyles.includes('Hands-on practice and experiments')) {
      return 'interactive-practical';
    }
    return 'mixed-media';
  }

  private determineInteractionLevel(feedbackPreferences: string[]): string {
    if (feedbackPreferences.includes('One-on-one expert guidance')) {
      return 'high-touch';
    } else if (feedbackPreferences.includes('Community forums and Q&A')) {
      return 'community-driven';
    } else if (feedbackPreferences.includes('Immediate automated feedback')) {
      return 'automated-responsive';
    }
    return 'moderate';
  }

  private determineGamificationLevel(learningEnvironment: string[]): string {
    if (learningEnvironment.includes('Competitive with leaderboards and achievements')) {
      return 'high-gamification';
    } else if (learningEnvironment.includes('Gamified with rewards and progression systems')) {
      return 'moderate-gamification';
    }
    return 'minimal-gamification';
  }

  private determineSocialLearningLevel(learningStyles: string[], environment: string[]): string {
    const socialIndicators = [
      'Discussion with peers and experts',
      'Collaborative with group projects and discussions'
    ];

    if (learningStyles.some(style => socialIndicators.includes(style)) ||
        environment.includes('Collaborative with group projects and discussions')) {
      return 'high-social';
    }
    return 'low-social';
  }

  private determinePracticalEmphasis(motivations: string[], experience: string[]): string {
    if (motivations.includes('Personal financial sovereignty') || experience.length > 2) {
      return 'high-practical';
    }
    return 'moderate-practical';
  }

  private determineSupportLevel(challenges: string[]): string {
    if (challenges.includes('No one to ask questions') ||
        challenges.includes('Information overload and complexity')) {
      return 'high-support';
    }
    return 'standard-support';
  }

  // Progress plan helper methods
  private defineMilestones(path: any, timeline: string): string[] {
    const milestones = path.phases.map((phase: string) => `Complete ${phase} phase`);

    if (timeline === '1-3 months (Intensive focus)') {
      milestones.unshift('Complete foundation setup in first 2 weeks');
    }

    milestones.push('Achieve path-specific competency certification');
    return milestones;
  }

  private determineCheckpointFrequency(timeCommitment: string): string {
    const frequencies = {
      '1-2 hours per week': 'bi-weekly',
      '3-5 hours per week': 'weekly',
      '6-10 hours per week': 'twice weekly',
      '10+ hours per week': 'every 3 days'
    };
    return frequencies[timeCommitment] || 'weekly';
  }

  private defineAdaptationTriggers(challenges: string[]): string[] {
    const triggers = ['Low engagement for 1 week', 'Failed assessment twice'];

    if (challenges.includes('Information overload and complexity')) {
      triggers.push('Content complexity feedback score below 3/5');
    }

    if (challenges.includes('Difficulty staying motivated')) {
      triggers.push('Login frequency drops below expected');
    }

    return triggers;
  }

  private defineInterventionStrategies(feedbackPreferences: string[]): string[] {
    const strategies = [];

    if (feedbackPreferences.includes('One-on-one expert guidance')) {
      strategies.push('Schedule mentor intervention call');
    }

    if (feedbackPreferences.includes('Peer discussion and collaboration')) {
      strategies.push('Connect with peer study group');
    }

    strategies.push('Adjust content difficulty level');
    strategies.push('Provide additional practice materials');

    return strategies;
  }

  private defineCelebrationMoments(environment: string[]): string[] {
    const moments = ['Module completion', 'Milestone achievement', 'Assessment success'];

    if (environment.includes('Competitive with leaderboards and achievements')) {
      moments.push('Leaderboard ranking achievement', 'Badge unlocking');
    }

    if (environment.includes('Collaborative with group projects and discussions')) {
      moments.push('Peer recognition', 'Group project success');
    }

    return moments;
  }
}

// Export the main function for external use
export async function generatePersonalizedCourse(responses: QuestionnaireResponse): Promise<PersonalizedCourseRecommendation> {
  const processor = new QuestionnaireProcessor();
  return await processor.processQuestionnaire(responses);
}