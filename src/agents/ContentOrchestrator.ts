import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { TutorialBuilder } from './TutorialBuilder.js';
import { AssessmentGenerator } from './AssessmentGenerator.js';
import { ProgressTracker } from './ProgressTracker.js';
import { run_CanvaDesignCoach } from './CanvaDesignCoach.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface ContentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  outputs: WorkflowOutput[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  last_run: string | null;
  success_count: number;
  failure_count: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'tutorial_generation' | 'assessment_generation' | 'design_creation' | 'progress_tracking' | 'content_review' | 'notification';
  config: any;
  dependencies: string[]; // IDs of steps that must complete first
  timeout_minutes: number;
  retry_count: number;
  success_criteria: string[];
}

export interface WorkflowTrigger {
  type: 'manual' | 'scheduled' | 'event_based' | 'progress_milestone';
  config: any;
  active: boolean;
}

export interface WorkflowOutput {
  type: 'tutorial' | 'assessment' | 'design_materials' | 'progress_report' | 'notification';
  destination: 'file_system' | 'email' | 'web_interface' | 'external_api';
  format: 'json' | 'html' | 'pdf' | 'csv' | 'markdown';
  config: any;
}

export interface WorkflowExecution {
  execution_id: string;
  workflow_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  step_results: { [stepId: string]: StepResult };
  outputs_generated: GeneratedOutput[];
  error_message?: string;
  duration_minutes?: number;
}

export interface StepResult {
  step_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  output: any;
  error?: string;
  retry_attempts: number;
}

export interface GeneratedOutput {
  type: string;
  file_path?: string;
  content?: any;
  metadata: any;
}

export interface ContentRequest {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  format: 'complete_course' | 'tutorial_only' | 'assessment_only' | 'design_materials' | 'custom';
  customizations?: {
    duration_minutes?: number;
    include_assessments?: boolean;
    include_designs?: boolean;
    assessment_types?: string[];
    design_style?: string;
    audience?: string;
  };
  output_directory?: string;
  notify_on_completion?: boolean;
}

export class ContentOrchestrator {
  private tutorialBuilder: TutorialBuilder;
  private assessmentGenerator: AssessmentGenerator;
  private progressTracker: ProgressTracker;
  private workflowsPath: string;
  private outputsPath: string;

  private predefinedWorkflows = [
    {
      id: 'complete_bitcoin_course',
      name: 'Complete Bitcoin Course Generator',
      description: 'Generates a comprehensive Bitcoin course with tutorials, assessments, and design materials',
      steps: [
        {
          id: 'generate_tutorial',
          name: 'Generate Tutorial Content',
          type: 'tutorial_generation',
          dependencies: [],
          timeout_minutes: 10,
          retry_count: 2,
          success_criteria: ['tutorial_generated', 'lessons_created']
        },
        {
          id: 'create_assessments',
          name: 'Create Assessments',
          type: 'assessment_generation',
          dependencies: ['generate_tutorial'],
          timeout_minutes: 5,
          retry_count: 2,
          success_criteria: ['assessments_generated']
        },
        {
          id: 'design_materials',
          name: 'Generate Design Materials',
          type: 'design_creation',
          dependencies: ['generate_tutorial'],
          timeout_minutes: 5,
          retry_count: 1,
          success_criteria: ['design_brief_created', 'csv_generated']
        },
        {
          id: 'package_content',
          name: 'Package Final Content',
          type: 'content_review',
          dependencies: ['create_assessments', 'design_materials'],
          timeout_minutes: 2,
          retry_count: 1,
          success_criteria: ['content_packaged']
        }
      ]
    },
    {
      id: 'adaptive_learning_path',
      name: 'Adaptive Learning Path Creator',
      description: 'Creates personalized learning content based on learner progress and performance',
      steps: [
        {
          id: 'analyze_progress',
          name: 'Analyze Learner Progress',
          type: 'progress_tracking',
          dependencies: [],
          timeout_minutes: 3,
          retry_count: 1,
          success_criteria: ['analytics_generated', 'recommendations_created']
        },
        {
          id: 'generate_adaptive_content',
          name: 'Generate Adaptive Content',
          type: 'tutorial_generation',
          dependencies: ['analyze_progress'],
          timeout_minutes: 8,
          retry_count: 2,
          success_criteria: ['personalized_content_created']
        },
        {
          id: 'create_targeted_assessments',
          name: 'Create Targeted Assessments',
          type: 'assessment_generation',
          dependencies: ['analyze_progress'],
          timeout_minutes: 5,
          retry_count: 2,
          success_criteria: ['targeted_assessments_created']
        }
      ]
    },
    {
      id: 'weekly_content_batch',
      name: 'Weekly Content Batch',
      description: 'Automatically generates weekly educational content batches',
      triggers: [
        {
          type: 'scheduled',
          config: { cron: '0 9 * * 1', timezone: 'UTC' }, // Every Monday at 9 AM
          active: true
        }
      ]
    }
  ];

  constructor() {
    this.tutorialBuilder = new TutorialBuilder();
    this.assessmentGenerator = new AssessmentGenerator();
    this.progressTracker = new ProgressTracker();
    this.workflowsPath = 'data/workflows';
    this.outputsPath = 'exports/automated_content';

    this.ensureDirectories();
    logger.info('ContentOrchestrator initialized with automated workflow capabilities');
  }

  private ensureDirectories(): void {
    [this.workflowsPath, this.outputsPath].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate content based on a simple request
   */
  async generateContent(request: ContentRequest): Promise<string> {
    logger.info(`Generating content for topic: ${request.topic} (${request.difficulty})`);
    
    const executionId = `exec_${Date.now()}`;
    const outputDir = request.output_directory || join(this.outputsPath, `${request.topic}_${request.difficulty}_${Date.now()}`);
    mkdirSync(outputDir, { recursive: true });

    try {
      const results: any = {};

      // Step 1: Generate tutorial if needed
      if (request.format === 'complete_course' || request.format === 'tutorial_only') {
        logger.info('Generating tutorial content...');
        const tutorialTopic = this.mapTopicForTutorial(request.topic);
        const tutorial = await this.tutorialBuilder.buildTutorial(tutorialTopic, {
          target_audience: request.difficulty === 'beginner' ? 'general' : 'professionals',
          time_constraint: request.customizations?.duration_minutes,
          include_live_data: request.customizations?.include_designs !== false
        });
        
        results.tutorial = tutorial;
        const tutorialPath = join(outputDir, 'tutorial.json');
        writeFileSync(tutorialPath, JSON.stringify(tutorial, null, 2));
        logger.info(`Tutorial saved to: ${tutorialPath}`);
      }

      // Step 2: Generate assessments if needed
      if (request.format === 'complete_course' || request.format === 'assessment_only') {
        if (request.customizations?.include_assessments !== false) {
          logger.info('Generating assessments...');
          
          // Generate multiple assessment types
          const assessmentTypes = request.customizations?.assessment_types || ['multiple_choice', 'scenario', 'reflection'];
          const assessments = [];

          // Main assessment
          const assessmentTopic = this.mapTopicForAssessment(request.topic);
          const mainAssessment = await this.assessmentGenerator.generateAssessment({
            title: `${request.topic} Mastery Assessment`,
            topic: assessmentTopic,
            difficulty: request.difficulty,
            question_count: 10,
            question_types: assessmentTypes as any,
            include_live_data: true
          });
          assessments.push(mainAssessment);

          // Quick quiz
          const quickQuiz = await this.assessmentGenerator.generateAssessment({
            title: `${request.topic} Quick Check`,
            topic: assessmentTopic,
            difficulty: request.difficulty,
            question_count: 5,
            question_types: ['multiple_choice', 'true_false'] as any,
            time_limit_minutes: 10,
            include_live_data: true
          });
          assessments.push(quickQuiz);

          results.assessments = assessments;
          const assessmentsPath = join(outputDir, 'assessments.json');
          writeFileSync(assessmentsPath, JSON.stringify(assessments, null, 2));
          logger.info(`Assessments saved to: ${assessmentsPath}`);
        }
      }

      // Step 3: Generate design materials if needed
      if (request.format === 'complete_course' || request.format === 'design_materials') {
        if (request.customizations?.include_designs !== false) {
          logger.info('Generating design materials...');
          
          const contentText = results.tutorial ? 
            this.extractContentText(results.tutorial) :
            `Educational content for ${request.topic} at ${request.difficulty} level`;
          
          const designMaterials = await run_CanvaDesignCoach(
            `${request.topic} Educational Materials`,
            contentText
          );
          
          results.design_materials = designMaterials;
          
          // Save design brief
          const briefPath = join(outputDir, 'design_brief.md');
          writeFileSync(briefPath, designMaterials.briefMd);
          
          // Save Canva CSV
          const csvPath = join(outputDir, 'canva_designs.csv');
          writeFileSync(csvPath, designMaterials.bulkCsv);
          
          logger.info(`Design materials saved: ${briefPath}, ${csvPath}`);
        }
      }

      // Step 4: Generate summary and metadata
      const summary = {
        execution_id: executionId,
        request,
        generated_at: new Date().toISOString(),
        components_generated: Object.keys(results),
        files_created: this.getGeneratedFiles(outputDir),
        next_steps: this.generateNextSteps(request, results)
      };

      const summaryPath = join(outputDir, 'generation_summary.json');
      writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

      // Step 5: Generate web-ready index
      const indexHtml = this.generateWebIndex(request, results, summary);
      const indexPath = join(outputDir, 'index.html');
      writeFileSync(indexPath, indexHtml);

      logger.info(`Content generation completed: ${executionId}`);
      logger.info(`Output directory: ${outputDir}`);
      
      return outputDir;

    } catch (error) {
      logger.error(`Content generation failed: ${executionId}`, error);
      throw error;
    }
  }

  /**
   * Create a custom workflow
   */
  async createWorkflow(workflow: Omit<ContentWorkflow, 'id' | 'created_at' | 'last_run' | 'success_count' | 'failure_count'>): Promise<string> {
    const workflowId = `workflow_${Date.now()}`;
    const fullWorkflow: ContentWorkflow = {
      id: workflowId,
      created_at: new Date().toISOString(),
      last_run: null,
      success_count: 0,
      failure_count: 0,
      ...workflow
    };

    const workflowPath = join(this.workflowsPath, `${workflowId}.json`);
    writeFileSync(workflowPath, JSON.stringify(fullWorkflow, null, 2));

    logger.info(`Created workflow: ${workflowId} - ${workflow.name}`);
    return workflowId;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, parameters: any = {}): Promise<WorkflowExecution> {
    logger.info(`Executing workflow: ${workflowId}`);
    
    const executionId = `exec_${workflowId}_${Date.now()}`;
    const execution: WorkflowExecution = {
      execution_id: executionId,
      workflow_id: workflowId,
      started_at: new Date().toISOString(),
      status: 'running',
      step_results: {},
      outputs_generated: []
    };

    try {
      // Load workflow definition
      const workflow = this.loadWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Execute steps in dependency order
      const executionOrder = this.calculateExecutionOrder(workflow.steps);
      
      for (const stepId of executionOrder) {
        const step = workflow.steps.find(s => s.id === stepId);
        if (!step) continue;

        logger.info(`Executing step: ${step.name} (${stepId})`);
        execution.step_results[stepId] = {
          step_id: stepId,
          status: 'running',
          started_at: new Date().toISOString(),
          output: null, // Add required output field
          retry_attempts: 0
        };

        try {
          const stepResult = await this.executeWorkflowStep(step, parameters, execution);
          execution.step_results[stepId] = {
            ...execution.step_results[stepId],
            status: 'completed',
            completed_at: new Date().toISOString(),
            output: stepResult
          };
        } catch (stepError) {
          execution.step_results[stepId] = {
            ...execution.step_results[stepId],
            status: 'failed',
            completed_at: new Date().toISOString(),
            error: stepError instanceof Error ? stepError.message : String(stepError)
          };
          
          // Stop execution on step failure
          throw stepError;
        }
      }

      execution.status = 'completed';
      execution.completed_at = new Date().toISOString();
      execution.duration_minutes = Math.round((Date.now() - new Date(execution.started_at).getTime()) / 60000);

      logger.info(`Workflow execution completed: ${executionId} in ${execution.duration_minutes} minutes`);
      
    } catch (error) {
      execution.status = 'failed';
      execution.error_message = error instanceof Error ? error.message : String(error);
      execution.completed_at = new Date().toISOString();
      
      logger.error(`Workflow execution failed: ${executionId}`, error);
    }

    // Save execution record
    const executionPath = join(this.workflowsPath, 'executions', `${executionId}.json`);
    mkdirSync(join(this.workflowsPath, 'executions'), { recursive: true });
    writeFileSync(executionPath, JSON.stringify(execution, null, 2));

    return execution;
  }

  /**
   * Generate a comprehensive educational package
   */
  async generateEducationalPackage(
    topic: string, 
    targetAudience: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<string> {
    logger.info(`Generating comprehensive educational package: ${topic} for ${targetAudience}`);
    
    return await this.generateContent({
      topic,
      difficulty: targetAudience,
      format: 'complete_course',
      customizations: {
        include_assessments: true,
        include_designs: true,
        assessment_types: ['multiple_choice', 'scenario', 'calculation', 'reflection'],
        duration_minutes: targetAudience === 'beginner' ? 120 : targetAudience === 'intermediate' ? 180 : 240
      },
      notify_on_completion: true
    });
  }

  // Helper methods
  private extractContentText(tutorial: any): string {
    if (!tutorial?.module?.lessons) return '';
    
    return tutorial.module.lessons
      .map((lesson: any) => {
        const content = lesson.content_blocks
          ?.map((block: any) => `${block.title}: ${block.content}`)
          ?.join('\n\n') || '';
        return `# ${lesson.title}\n\n${content}`;
      })
      .join('\n\n---\n\n');
  }

  private generateNextSteps(request: ContentRequest, results: any): string[] {
    const steps = [];
    
    if (results.tutorial) {
      steps.push('Review generated tutorial content and customize as needed');
      steps.push('Test tutorial flow with target audience');
    }
    
    if (results.assessments) {
      steps.push('Validate assessment questions for accuracy and difficulty');
      steps.push('Set up automated grading and feedback systems');
    }
    
    if (results.design_materials) {
      steps.push('Import CSV into Canva for bulk design creation');
      steps.push('Customize design templates to match brand guidelines');
    }
    
    steps.push('Deploy content to learning management system');
    steps.push('Set up progress tracking and analytics');
    
    return steps;
  }

  private getGeneratedFiles(directory: string): string[] {
    // This would scan the directory for generated files
    // Simplified for demo
    return [
      'tutorial.json',
      'assessments.json', 
      'design_brief.md',
      'canva_designs.csv',
      'generation_summary.json',
      'index.html'
    ];
  }

  private generateWebIndex(request: ContentRequest, results: any, summary: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${request.topic} Educational Content</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f0f8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .file-list { background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .file-list ul { margin: 0; padding-left: 20px; }
        .next-steps { background: #fff8dc; padding: 15px; border-radius: 5px; }
        .generated-at { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📚 ${request.topic} Educational Content</h1>
        <p><strong>Difficulty:</strong> ${request.difficulty} | <strong>Format:</strong> ${request.format}</p>
        <p class="generated-at">Generated: ${summary.generated_at}</p>
    </div>

    <div class="section">
        <h2>📋 Components Generated</h2>
        <ul>
            ${summary.components_generated.map((comp: string) => `<li>✅ ${comp.replace('_', ' ').toUpperCase()}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>📁 Generated Files</h2>
        <div class="file-list">
            <ul>
                ${summary.files_created.map((file: string) => `<li>${file}</li>`).join('')}
            </ul>
        </div>
    </div>

    <div class="section next-steps">
        <h2>🎯 Next Steps</h2>
        <ol>
            ${summary.next_steps.map((step: string) => `<li>${step}</li>`).join('')}
        </ol>
    </div>

    <div class="section">
        <h2>🚀 Quick Actions</h2>
        <p>
            • <a href="tutorial.json" download>Download Tutorial JSON</a><br>
            • <a href="assessments.json" download>Download Assessments</a><br>
            • <a href="canva_designs.csv" download>Download Canva CSV</a><br>
            • <a href="design_brief.md" download>Download Design Brief</a>
        </p>
    </div>
</body>
</html>`;
  }

  private loadWorkflow(workflowId: string): ContentWorkflow | null {
    // Implementation would load from file system
    // For demo, return predefined workflow
    const workflow = this.predefinedWorkflows.find(w => w.id === workflowId);
    return workflow ? {
      ...workflow,
      outputs: [],
      status: 'inactive' as const,
      created_at: new Date().toISOString(),
      last_run: '',
      steps: workflow.steps || []
    } : null;
  }

  private calculateExecutionOrder(steps: WorkflowStep[]): string[] {
    // Simplified topological sort
    const order: string[] = [];
    const visited = new Set<string>();
    
    const visit = (stepId: string) => {
      if (visited.has(stepId)) return;
      
      const step = steps.find(s => s.id === stepId);
      if (!step) return;
      
      // Visit dependencies first
      step.dependencies.forEach(depId => visit(depId));
      
      visited.add(stepId);
      order.push(stepId);
    };
    
    steps.forEach(step => visit(step.id));
    return order;
  }

  private async executeWorkflowStep(step: WorkflowStep, parameters: any, execution: WorkflowExecution): Promise<any> {
    // Map topic names for different components
    const tutorialTopic = this.mapTopicForTutorial(parameters.topic || 'bitcoin-basics');
    const assessmentTopic = this.mapTopicForAssessment(parameters.topic || 'fees');
    
    switch (step.type) {
      case 'tutorial_generation':
        return await this.tutorialBuilder.buildTutorial(tutorialTopic, parameters);
      
      case 'assessment_generation':
        return await this.assessmentGenerator.generateAssessment({
          title: `${parameters.topic} Assessment`,
          topic: assessmentTopic,
          difficulty: parameters.difficulty || 'beginner',
          question_count: 8,
          ...parameters
        });
      
      case 'design_creation':
        const content = parameters.content || `Educational content for ${parameters.topic}`;
        return await run_CanvaDesignCoach(parameters.title || 'Educational Materials', content);
      
      case 'progress_tracking':
        if (parameters.learner_id) {
          return await this.progressTracker.generateProgressAnalytics(parameters.learner_id);
        }
        return { message: 'Progress tracking step completed - no learner specified' };
      
      case 'content_review':
        return { status: 'reviewed', timestamp: new Date().toISOString() };
      
      default:
        return { status: 'completed', message: `Step type ${step.type} executed successfully` };
    }
  }

  /**
   * Map generic topic names to TutorialBuilder-specific topic names
   */
  private mapTopicForTutorial(topic: string): string {
    const tutorialMapping: { [key: string]: string } = {
      'fees': 'transaction-fees',
      'transaction-fees': 'transaction-fees',
      'wallets': 'bitcoin-basics', // No specific wallets tutorial, use basics
      'scaling': 'lightning-network',
      'security': 'security-privacy',
      'security-privacy': 'security-privacy',
      'mining': 'mining',
      'lightning': 'lightning-network',
      'lightning-network': 'lightning-network',
      'bitcoin-basics': 'bitcoin-basics'
    };

    return tutorialMapping[topic] || 'bitcoin-basics';
  }

  /**
   * Map generic topic names to AssessmentGenerator/SocraticTutor-specific topic names
   */
  private mapTopicForAssessment(topic: string): string {
    const assessmentMapping: { [key: string]: string } = {
      'transaction-fees': 'fees',
      'fees': 'fees',
      'wallets': 'wallets',
      'scaling': 'scaling', 
      'lightning-network': 'scaling', // Lightning is part of scaling
      'security': 'security',
      'security-privacy': 'security',
      'mining': 'mining',
      'bitcoin-basics': 'fees' // Use fees as default since it's most fundamental
    };

    return assessmentMapping[topic] || 'fees';
  }
}