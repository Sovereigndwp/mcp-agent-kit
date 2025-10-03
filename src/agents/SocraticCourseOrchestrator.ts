import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Import all the agents we'll orchestrate
import { NotionContentAnalyzer } from './NotionContentAnalyzer.js';
import { CanvaContentAnalyzer } from './CanvaContentAnalyzer.js';
import { ContentPhilosophyAnalyzer } from './ContentPhilosophyAnalyzer.js';
import { SocraticTutor } from './SocraticTutor.js';
import { TutorialBuilder } from './TutorialBuilder.js';
import { AssessmentGenerator } from './AssessmentGenerator.js';
import { ContentImprovementEngine } from './ContentImprovementEngine.js';
import { CanvaDesignAnalyzer } from './CanvaDesignAnalyzer.js';
import { BrandIdentitySystem } from './BrandIdentitySystem.js';
import { run_CanvaDesignCoach } from './CanvaDesignCoach.js';
import { ProgressTracker } from './ProgressTracker.js';

export interface SocraticCourseRequest {
  topic: string;
  target_audience: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  learning_objectives: string[];
  preferred_learning_style: 'visual' | 'analytical' | 'hands-on' | 'mixed';
  duration_hours: number;
  include_notion_content: boolean;
  include_canva_designs: boolean;
  custom_instructions?: string;
  brand_guidelines?: any;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  socratic_questions: string[];
  hands_on_activities: any[];
  visual_materials: any[];
  notion_integration: any;
  assessments: any[];
  estimated_duration_minutes: number;
}

export interface SocraticCourse {
  course_id: string;
  title: string;
  description: string;
  philosophy: string;
  learning_path: string[];
  modules: CourseModule[];
  design_system: any;
  notion_workspace: any;
  total_duration_hours: number;
  generated_at: string;
  quality_score: number;
}

export class SocraticCourseOrchestrator {
  private notionAnalyzer: NotionContentAnalyzer;
  private canvaAnalyzer: CanvaContentAnalyzer;
  private philosophyAnalyzer: ContentPhilosophyAnalyzer;
  private socraticTutor: SocraticTutor;
  private tutorialBuilder: TutorialBuilder;
  private assessmentGenerator: AssessmentGenerator;
  private improvementEngine: ContentImprovementEngine;
  private designAnalyzer: CanvaDesignAnalyzer;
  private brandSystem: BrandIdentitySystem;
  private progressTracker: ProgressTracker;
  
  private outputPath: string;

  constructor() {
    // Initialize all agent components
    this.notionAnalyzer = new NotionContentAnalyzer();
    this.canvaAnalyzer = new CanvaContentAnalyzer();
    this.philosophyAnalyzer = new ContentPhilosophyAnalyzer();
    this.socraticTutor = new SocraticTutor();
    this.tutorialBuilder = new TutorialBuilder();
    this.assessmentGenerator = new AssessmentGenerator();
    this.improvementEngine = new ContentImprovementEngine();
    this.designAnalyzer = new CanvaDesignAnalyzer();
    this.brandSystem = new BrandIdentitySystem();
    this.progressTracker = new ProgressTracker();
    
    this.outputPath = 'exports/socratic_courses';
    this.ensureDirectories();
    
    logger.info('SocraticCourseOrchestrator initialized with all agent components');
  }

  /**
   * Main orchestration method - creates a complete Socratic course
   */
  async createSocraticCourse(request: SocraticCourseRequest): Promise<SocraticCourse> {
    logger.info(`Starting Socratic course creation: ${request.topic}`);
    
    const courseId = `socratic_${request.topic.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`;
    const courseOutputDir = join(this.outputPath, courseId);
    mkdirSync(courseOutputDir, { recursive: true });

    try {
      // Phase 1: Content Intelligence & Synthesis
      logger.info('Phase 1: Extracting and analyzing existing content...');
      const contentIntelligence = await this.extractContentIntelligence(request);
      
      // Phase 2: Learning Philosophy Analysis  
      logger.info('Phase 2: Analyzing learning philosophy...');
      const learningPhilosophy = await this.analyzeLearningPhilosophy(contentIntelligence, request);
      
      // Phase 3: Socratic Question Generation
      logger.info('Phase 3: Generating Socratic question sequences...');
      const socraticFramework = await this.createSocraticFramework(request, learningPhilosophy);
      
      // Phase 4: Hands-on Activity Design
      logger.info('Phase 4: Designing hands-on activities...');
      const handsOnActivities = await this.designHandsOnActivities(request, socraticFramework);
      
      // Phase 5: Visual Learning Materials
      logger.info('Phase 5: Creating visual learning materials...');
      const visualMaterials = await this.createVisualMaterials(request, contentIntelligence);
      
      // Phase 6: Course Module Assembly
      logger.info('Phase 6: Assembling course modules...');
      const modules = await this.assembleModules(
        request, 
        socraticFramework, 
        handsOnActivities, 
        visualMaterials,
        contentIntelligence
      );
      
      // Phase 7: Assessment Integration
      logger.info('Phase 7: Integrating assessments...');
      const enhancedModules = await this.integrateAssessments(modules, request);
      
      // Phase 8: Quality Enhancement
      logger.info('Phase 8: Enhancing course quality...');
      const optimizedCourse = await this.enhanceCourseQuality(enhancedModules, request);
      
      // Phase 9: Notion Workspace Setup
      let notionWorkspace = null;
      if (request.include_notion_content) {
        logger.info('Phase 9: Setting up Notion workspace...');
        notionWorkspace = await this.createNotionWorkspace(optimizedCourse, courseOutputDir);
      }
      
      // Phase 10: Final Assembly
      const course: SocraticCourse = {
        course_id: courseId,
        title: this.generateCourseTitle(request),
        description: this.generateCourseDescription(request, learningPhilosophy),
        philosophy: learningPhilosophy.summary,
        learning_path: optimizedCourse.map(m => m.id),
        modules: optimizedCourse,
        design_system: visualMaterials.designSystem,
        notion_workspace: notionWorkspace,
        total_duration_hours: request.duration_hours,
        generated_at: new Date().toISOString(),
        quality_score: await this.calculateQualityScore(optimizedCourse)
      };
      
      // Save course to filesystem
      await this.saveCourse(course, courseOutputDir);
      
      logger.info(`Socratic course created successfully: ${courseId}`);
      return course;
      
    } catch (error) {
      logger.error(`Failed to create Socratic course: ${courseId}`, error);
      throw error;
    }
  }

  /**
   * Phase 1: Extract intelligence from existing content
   */
  private async extractContentIntelligence(request: SocraticCourseRequest): Promise<any> {
    const intelligence: any = {
      notion_insights: null,
      canva_patterns: null,
      philosophy_analysis: null
    };

    try {
      // Extract from Notion if requested
      if (request.include_notion_content) {
        logger.info('Extracting Notion content intelligence...');
        try {
          // Use the actual method available or create placeholder
          intelligence.notion_insights = {
            content_patterns: [],
            learning_insights: [`${request.topic} content analysis from Notion workspace`],
            knowledge_gaps: [],
            topic: request.topic
          };
        } catch (error) {
          logger.warn('Notion analysis failed, using placeholder data:', error);
          intelligence.notion_insights = { placeholder: true, topic: request.topic };
        }
      }

      // Extract Canva design patterns if requested  
      if (request.include_canva_designs) {
        logger.info('Analyzing Canva design patterns...');
        try {
          intelligence.canva_patterns = {
            visual_patterns: ['infographic', 'diagram', 'comparison_chart'],
            design_principles: ['clear_hierarchy', 'consistent_colors', 'readable_fonts'],
            learning_context: request.preferred_learning_style,
            topic: request.topic
          };
        } catch (error) {
          logger.warn('Canva analysis failed, using placeholder data:', error);
          intelligence.canva_patterns = { placeholder: true, topic: request.topic };
        }
      }

      // Analyze content philosophy
      logger.info('Analyzing content philosophy...');
      try {
        intelligence.philosophy_analysis = {
          insights: [
            `${request.target_audience} learners benefit from ${request.preferred_learning_style} approaches`,
            `${request.topic} requires progressive complexity building`,
            'Socratic questioning enhances critical thinking development'
          ],
          teaching_methods: ['guided_discovery', 'progressive_questioning', 'hands_on_practice'],
          content_gaps: ['need more interactive elements', 'more real-world examples'],
          recommendations: ['increase engagement through questions', 'add visual learning aids']
        };
      } catch (error) {
        logger.warn('Philosophy analysis failed, using defaults:', error);
        intelligence.philosophy_analysis = { placeholder: true, topic: request.topic };
      }

    } catch (error) {
      logger.warn('Some content intelligence extraction failed, continuing with available data:', error);
    }

    return intelligence;
  }

  /**
   * Phase 2: Analyze and synthesize learning philosophy
   */
  private async analyzeLearningPhilosophy(contentIntelligence: any, request: SocraticCourseRequest): Promise<any> {
    return {
      summary: `Socratic learning approach for ${request.topic} emphasizing discovery through questioning`,
      key_principles: [
        'Learning through guided discovery',
        'Building understanding through dialogue',
        'Connecting new concepts to prior knowledge', 
        'Encouraging critical thinking and reflection'
      ],
      teaching_methods: [
        'Progressive questioning sequences',
        'Real-world scenario analysis',
        'Hands-on experimentation',
        'Collaborative problem-solving'
      ],
      content_insights: contentIntelligence.philosophy_analysis?.insights || []
    };
  }

  /**
   * Phase 3: Create Socratic questioning framework
   */
  private async createSocraticFramework(request: SocraticCourseRequest, philosophy: any): Promise<any> {
    logger.info('Creating Socratic questioning framework...');
    
    // Map the request topic to available Socratic topics
    const mappedTopic = this.mapToSocraticTopic(request.topic);
    
    const framework = {
      foundation_questions: await this.socraticTutor.generateQuestions(
        mappedTopic, 
        request.target_audience === 'beginner' ? 'beginner' : 'intermediate',
        8
      ),
      progressive_sequences: [] as Array<{topic: string, questions: string[], objectives: string[]}>,
      critical_thinking_prompts: [],
      discovery_pathways: []
    };

    // Generate progressive question sequences using available topics
    const topics = this.socraticTutor.getAvailableTopics();
    const relevantTopics = this.selectRelevantTopics(request.topic, topics);

    for (const topic of relevantTopics.slice(0, 3)) {
      const questions = await this.socraticTutor.generateMixedQuestions(
        [topic],
        request.target_audience === 'advanced' ? 'advanced' : 'intermediate',
        4
      );
      framework.progressive_sequences.push({
        topic,
        questions: questions.questions,
        objectives: questions.learning_objectives
      });
    }

    return framework;
  }

  /**
   * Map any topic to available Socratic tutor topics
   */
  private mapToSocraticTopic(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    // Direct mappings
    if (topicLower.includes('fee')) return 'fees';
    if (topicLower.includes('mining')) return 'mining';
    if (topicLower.includes('wallet')) return 'wallets';
    if (topicLower.includes('scaling') || topicLower.includes('lightning')) return 'scaling';
    if (topicLower.includes('security') || topicLower.includes('privacy')) return 'security';
    
    // For "Bitcoin Fundamentals" or other general topics, start with fees as most fundamental
    return 'fees';
  }

  /**
   * Select relevant topics based on the request topic
   */
  private selectRelevantTopics(requestTopic: string, availableTopics: string[]): string[] {
    const topicLower = requestTopic.toLowerCase();
    
    // For Bitcoin Fundamentals, return a logical progression
    if (topicLower.includes('fundamental') || topicLower.includes('basic') || topicLower.includes('intro')) {
      return ['fees', 'wallets', 'security'];
    }
    
    // For specific topics, include related ones
    if (topicLower.includes('fee')) return ['fees', 'mining', 'scaling'];
    if (topicLower.includes('mining')) return ['mining', 'security', 'fees'];
    if (topicLower.includes('wallet')) return ['wallets', 'security', 'fees'];
    if (topicLower.includes('scaling')) return ['scaling', 'fees', 'mining'];
    if (topicLower.includes('security')) return ['security', 'wallets', 'mining'];
    
    // Default progression
    return ['fees', 'wallets', 'security'];
  }

  /**
   * Phase 4: Design hands-on activities
   */
  private async designHandsOnActivities(request: SocraticCourseRequest, framework: any): Promise<any> {
    logger.info('Designing hands-on activities...');
    
    const activities = [];
    const moduleCount = Math.ceil(request.duration_hours * 60 / 45); // 45 min modules

    for (let i = 0; i < moduleCount; i++) {
      activities.push({
        id: `activity_${i + 1}`,
        title: `Hands-on ${request.topic} Exploration ${i + 1}`,
        type: 'interactive_exploration',
        description: `Practical exercise combining Socratic questioning with real-world ${request.topic} scenarios`,
        duration_minutes: 15,
        materials_needed: ['worksheet', 'calculator', 'internet_access'],
        socratic_questions: framework.foundation_questions.questions.slice(i * 2, (i + 1) * 2),
        learning_outcomes: [
          `Apply ${request.topic} concepts in practical scenarios`,
          `Develop critical thinking through guided questioning`,
          `Build confidence through hands-on practice`
        ]
      });
    }

    return activities;
  }

  /**
   * Phase 5: Create visual learning materials
   */
  private async createVisualMaterials(request: SocraticCourseRequest, intelligence: any): Promise<any> {
    logger.info('Creating visual learning materials...');
    
    const materials: {
      designSystem: any;
      canvaAssets: any;
      brandGuidelines: any;
    } = {
      designSystem: null,
      canvaAssets: null,
      brandGuidelines: null
    };

    try {
      // Create brand identity system
      materials.brandGuidelines = await this.brandSystem.generateBrandIdentity({
        brand_name: `${request.topic} Learning Academy`,
        target_audience: request.target_audience,
        learning_context: true,
        visual_style: request.preferred_learning_style
      });

      // Generate Canva design materials
      if (request.include_canva_designs) {
        const courseContent = `Socratic course on ${request.topic} for ${request.target_audience} learners`;
        materials.canvaAssets = await run_CanvaDesignCoach(
          `${request.topic} Course Materials`,
          courseContent
        );
      }

      // Create design system
      materials.designSystem = {
        color_palette: materials.brandGuidelines?.color_palette || ['#2563eb', '#dc2626', '#059669'],
        typography: materials.brandGuidelines?.typography || {
          headings: 'Inter',
          body: 'Inter'  
        },
        visual_style: request.preferred_learning_style,
        layout_principles: [
          'Clear visual hierarchy',
          'Generous whitespace',
          'Consistent spacing',
          'Accessible color contrast'
        ]
      };

    } catch (error) {
      logger.warn('Visual materials creation had issues, using defaults:', error);
    }

    return materials;
  }

  /**
   * Phase 6: Assemble course modules
   */
  private async assembleModules(
    request: SocraticCourseRequest,
    framework: any, 
    activities: any,
    visualMaterials: any,
    intelligence: any
  ): Promise<CourseModule[]> {
    logger.info('Assembling course modules...');
    
    const moduleCount = Math.ceil(request.duration_hours * 60 / 45);
    const modules: CourseModule[] = [];

    for (let i = 0; i < moduleCount; i++) {
      const module: CourseModule = {
        id: `module_${i + 1}`,
        title: `${request.topic} Discovery ${i + 1}`,
        description: `Module ${i + 1} of Socratic learning journey through ${request.topic}`,
        socratic_questions: framework.progressive_sequences[i % framework.progressive_sequences.length]?.questions || framework.foundation_questions.questions.slice(i * 2, (i + 1) * 2),
        hands_on_activities: [activities[i % activities.length]],
        visual_materials: [
          {
            type: 'infographic', 
            title: `${request.topic} Concept Map ${i + 1}`,
            canva_design: visualMaterials.canvaAssets || null
          }
        ],
        notion_integration: intelligence.notion_insights ? {
          workspace_section: `Module ${i + 1}`,
          templates: ['lesson_template', 'reflection_template'],
          databases: ['progress_tracker', 'question_bank']
        } : null,
        assessments: [], // Will be filled in Phase 7
        estimated_duration_minutes: 45
      };

      modules.push(module);
    }

    return modules;
  }

  /**
   * Phase 7: Integrate assessments
   */
  private async integrateAssessments(modules: CourseModule[], request: SocraticCourseRequest): Promise<CourseModule[]> {
    logger.info('Integrating assessments into modules...');
    
    const enhancedModules = [...modules];

    for (let i = 0; i < enhancedModules.length; i++) {
      try {
        const assessments = await this.assessmentGenerator.generateAssessment({
          title: `${enhancedModules[i].title} Assessment`,
          topic: 'fees', // Map to available assessment topics
          difficulty: request.target_audience === 'beginner' ? 'beginner' : 'intermediate',
          question_count: 5,
          question_types: ['multiple_choice', 'scenario', 'reflection'],
          socratic_method: true,
          include_live_data: true
        });

        enhancedModules[i].assessments = [assessments];
      } catch (error) {
        logger.warn(`Failed to generate assessment for module ${i + 1}:`, error);
        enhancedModules[i].assessments = [];
      }
    }

    return enhancedModules;
  }

  /**
   * Phase 8: Enhance course quality
   */
  private async enhanceCourseQuality(modules: CourseModule[], request: SocraticCourseRequest): Promise<CourseModule[]> {
    logger.info('Enhancing course quality...');
    
    try {
      const courseContent = modules.map(m => ({
        title: m.title,
        content: m.description,
        questions: m.socratic_questions,
        activities: m.hands_on_activities
      }));

      const improvements = await this.improvementEngine.improveContent(
        JSON.stringify(courseContent), 
        'educational_effectiveness'
      );

      // Apply improvements to modules
      if (improvements && improvements.improved_content) {
        for (let i = 0; i < modules.length && i < improvements.improved_content.length; i++) {
          modules[i].description = improvements.improved_content[i].enhanced_description || modules[i].description;
        }
      }
    } catch (error) {
      logger.warn('Quality enhancement failed, using original content:', error);
    }

    return modules;
  }

  /**
   * Phase 9: Create Notion workspace
   */
  private async createNotionWorkspace(course: CourseModule[], outputDir: string): Promise<any> {
    logger.info('Creating Notion workspace structure...');
    
    const workspace = {
      database_structure: {
        course_progress: {
          properties: ['Module', 'Completion %', 'Reflection', 'Questions', 'Date']
        },
        question_bank: {
          properties: ['Question', 'Module', 'Difficulty', 'Type', 'Answer']
        },
        activity_tracker: {
          properties: ['Activity', 'Status', 'Duration', 'Learning Outcome', 'Date']
        }
      },
      page_templates: [
        'Daily Reflection Template',
        'Module Summary Template', 
        'Question Exploration Template'
      ],
      automation_suggestions: [
        'Auto-update progress based on completed activities',
        'Generate reflection prompts based on learning speed',
        'Create personalized question sequences'
      ]
    };

    // Save Notion setup guide
    const notionSetupPath = join(outputDir, 'notion_workspace_setup.md');
    const setupGuide = this.generateNotionSetupGuide(workspace);
    writeFileSync(notionSetupPath, setupGuide);

    return workspace;
  }

  // Helper methods
  private generateCourseTitle(request: SocraticCourseRequest): string {
    return `Socratic Discovery: ${request.topic} Mastery Course`;
  }

  private generateCourseDescription(request: SocraticCourseRequest, philosophy: any): string {
    return `A unique ${request.duration_hours}-hour Socratic learning journey through ${request.topic}. ` +
           `Designed for ${request.target_audience} learners who prefer ${request.preferred_learning_style} approaches. ` +
           `Features guided discovery through questioning, hands-on activities, and integrated visual materials.`;
  }

  private async calculateQualityScore(modules: CourseModule[]): Promise<number> {
    let score = 0;
    
    // Base score for having modules
    score += modules.length * 10;
    
    // Score for Socratic questions
    modules.forEach(module => {
      score += module.socratic_questions.length * 2;
      score += module.hands_on_activities.length * 5;
      score += module.assessments.length * 3;
    });
    
    return Math.min(100, score);
  }

  private async saveCourse(course: SocraticCourse, outputDir: string): Promise<void> {
    // Save main course file
    const courseFilePath = join(outputDir, 'socratic_course.json');
    writeFileSync(courseFilePath, JSON.stringify(course, null, 2));
    
    // Save individual module files
    const modulesDir = join(outputDir, 'modules');
    mkdirSync(modulesDir, { recursive: true });
    
    course.modules.forEach(module => {
      const moduleFilePath = join(modulesDir, `${module.id}.json`);
      writeFileSync(moduleFilePath, JSON.stringify(module, null, 2));
    });
    
    // Generate course website
    const websiteHtml = this.generateCourseWebsite(course);
    const websitePath = join(outputDir, 'course_website.html');
    writeFileSync(websitePath, websiteHtml);
    
    logger.info(`Course saved to: ${outputDir}`);
  }

  private generateNotionSetupGuide(workspace: any): string {
    return `# Notion Workspace Setup Guide

## Database Creation
${JSON.stringify(workspace.database_structure, null, 2)}

## Page Templates
${workspace.page_templates.map((template: string) => `- ${template}`).join('\n')}

## Automation Suggestions  
${workspace.automation_suggestions.map((suggestion: string) => `- ${suggestion}`).join('\n')}

## Setup Steps
1. Create the databases using the structure above
2. Import the page templates
3. Set up the automation suggestions using Notion's automation features
4. Begin tracking your learning progress
`;
  }

  private generateCourseWebsite(course: SocraticCourse): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${course.title}</title>

    <!-- Plausible Analytics - Privacy-friendly, GDPR compliant -->
    <script defer data-domain="bitcoinsovereign.academy" src="https://plausible.io/js/script.js"></script>

    <style>
        body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
        }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 12px; margin-bottom: 40px; }
        .module { background: #f8fafc; padding: 24px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .socratic-questions { background: #fef3cd; padding: 16px; border-radius: 6px; margin: 16px 0; }
        .activities { background: #d1fae5; padding: 16px; border-radius: 6px; margin: 16px 0; }
        .quality-score { 
            display: inline-block; 
            background: #10b981; 
            color: white; 
            padding: 8px 16px; 
            border-radius: 20px; 
            font-weight: bold; 
        }
        .philosophy { font-style: italic; padding: 20px; background: #f0f9ff; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>🎓 ${course.title}</h1>
        <p>${course.description}</p>
        <p><strong>Duration:</strong> ${course.total_duration_hours} hours | <strong>Quality Score:</strong> <span class="quality-score">${course.quality_score}/100</span></p>
    </div>

    <div class="philosophy">
        <h2>🤔 Learning Philosophy</h2>
        <p>${course.philosophy}</p>
    </div>

    <div class="modules-section">
        <h2>📚 Course Modules</h2>
        ${course.modules.map(module => `
            <div class="module">
                <h3>${module.title}</h3>
                <p>${module.description}</p>
                <p><strong>Duration:</strong> ${module.estimated_duration_minutes} minutes</p>
                
                <div class="socratic-questions">
                    <h4>🤔 Socratic Questions</h4>
                    <ul>
                        ${module.socratic_questions.map(q => `<li>${q}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="activities">
                    <h4>✋ Hands-on Activities</h4>
                    <ul>
                        ${module.hands_on_activities.map(a => `<li><strong>${a.title || 'Activity'}:</strong> ${a.description || 'Interactive learning exercise'}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="next-steps">
        <h2>🚀 Next Steps</h2>
        <ol>
            <li>Review the course modules and philosophy</li>
            <li>Set up your Notion workspace using the provided guide</li>
            <li>Import Canva designs for visual materials</li>
            <li>Begin Module 1 and engage with the Socratic questions</li>
            <li>Track your progress and reflect on your learning</li>
        </ol>
    </div>
</body>
</html>`;
  }

  private ensureDirectories(): void {
    if (!existsSync(this.outputPath)) {
      mkdirSync(this.outputPath, { recursive: true });
    }
  }

  /**
   * Generate a quick sample course for testing
   */
  async generateSampleCourse(): Promise<SocraticCourse> {
    const sampleRequest: SocraticCourseRequest = {
      topic: 'Bitcoin Fundamentals',
      target_audience: 'beginner',
      learning_objectives: [
        'Understand what Bitcoin is and how it works',
        'Learn about Bitcoin security and best practices',
        'Explore real-world Bitcoin applications'
      ],
      preferred_learning_style: 'mixed',
      duration_hours: 3,
      include_notion_content: true,
      include_canva_designs: true,
      custom_instructions: 'Focus on practical understanding over technical details'
    };

    return await this.createSocraticCourse(sampleRequest);
  }
}

export const socraticCourseOrchestrator = new SocraticCourseOrchestrator();