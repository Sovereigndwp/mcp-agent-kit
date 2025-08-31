import { logger } from '../utils/logger.js';
import { cacheStore } from '../utils/kv.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LearnerProfile {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  last_active: string;
  learning_preferences: {
    pace: 'slow' | 'moderate' | 'fast';
    difficulty_preference: 'beginner' | 'intermediate' | 'advanced';
    preferred_topics: string[];
    learning_style: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  };
  current_streak: number;
  total_study_time_minutes: number;
  achievements: Achievement[];
}

export interface LessonProgress {
  lesson_id: string;
  tutorial_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  time_spent_minutes: number;
  objectives_completed: string[];
  notes?: string;
  difficulty_rating?: 1 | 2 | 3 | 4 | 5; // How difficult the learner found it
  understanding_rating?: 1 | 2 | 3 | 4 | 5; // How well they understood
}

export interface AssessmentAttempt {
  attempt_id: string;
  assessment_id: string;
  learner_id: string;
  started_at: string;
  completed_at?: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  time_taken_minutes: number;
  question_responses: QuestionResponse[];
  feedback_received: string;
  areas_for_improvement: string[];
  strengths_identified: string[];
}

export interface QuestionResponse {
  question_id: string;
  response: any;
  correct: boolean;
  points_earned: number;
  time_taken_seconds: number;
  hints_used: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  category: 'progress' | 'streak' | 'mastery' | 'special';
  requirements_met: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimated_duration_hours: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  modules: PathModule[];
  completion_rate: number; // 0-100
}

export interface PathModule {
  tutorial_id: string;
  required: boolean;
  unlock_criteria?: string[];
  estimated_duration_minutes: number;
}

export interface StudySession {
  id: string;
  learner_id: string;
  started_at: string;
  ended_at?: string;
  activities: StudyActivity[];
  total_time_minutes: number;
  topics_covered: string[];
  goals_set: string[];
  goals_achieved: string[];
}

export interface StudyActivity {
  type: 'tutorial' | 'assessment' | 'review' | 'practice';
  content_id: string;
  time_spent_minutes: number;
  completed: boolean;
}

export interface ProgressAnalytics {
  learner_id: string;
  generated_at: string;
  overall_progress: {
    tutorials_completed: number;
    assessments_passed: number;
    total_study_time_hours: number;
    current_streak_days: number;
    mastery_level: 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  topic_mastery: { [topic: string]: number }; // 0-100 percentage
  learning_velocity: {
    lessons_per_week: number;
    improvement_trend: 'improving' | 'stable' | 'declining';
  };
  recommendations: string[];
  strengths: string[];
  areas_for_improvement: string[];
}

export class ProgressTracker {
  private dataPath: string;

  private achievements = [
    {
      id: 'first_lesson',
      title: 'First Step',
      description: 'Completed your first Bitcoin lesson',
      icon: '🎯',
      category: 'progress',
      check: (profile: LearnerProfile, progress: LessonProgress[]) => 
        progress.some(p => p.status === 'completed')
    },
    {
      id: 'week_streak',
      title: 'Consistent Learner',
      description: 'Maintained a 7-day learning streak',
      icon: '🔥',
      category: 'streak',
      check: (profile: LearnerProfile) => profile.current_streak >= 7
    },
    {
      id: 'fees_master',
      title: 'Fee Expert',
      description: 'Mastered Bitcoin transaction fees',
      icon: '⚡',
      category: 'mastery',
      check: (profile: LearnerProfile, progress: LessonProgress[], assessments: AssessmentAttempt[]) => {
        const feesAssessments = assessments.filter(a => a.assessment_id.includes('fees'));
        return feesAssessments.some(a => a.passed && a.percentage >= 85);
      }
    },
    {
      id: 'mining_master',
      title: 'Mining Expert',
      description: 'Mastered Bitcoin mining concepts',
      icon: '⛏️',
      category: 'mastery',
      check: (profile: LearnerProfile, progress: LessonProgress[], assessments: AssessmentAttempt[]) => {
        const miningAssessments = assessments.filter(a => a.assessment_id.includes('mining'));
        return miningAssessments.some(a => a.passed && a.percentage >= 85);
      }
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved 100% on an assessment',
      icon: '💯',
      category: 'mastery',
      check: (profile: LearnerProfile, progress: LessonProgress[], assessments: AssessmentAttempt[]) => 
        assessments.some(a => a.percentage === 100)
    },
    {
      id: 'quick_learner',
      title: 'Quick Learner',
      description: 'Completed 5 lessons in one day',
      icon: '🚀',
      category: 'special',
      check: (profile: LearnerProfile, progress: LessonProgress[]) => {
        const today = new Date().toDateString();
        const todayCompletions = progress.filter(p => 
          p.completed_at && new Date(p.completed_at).toDateString() === today
        );
        return todayCompletions.length >= 5;
      }
    }
  ];

  constructor(dataPath: string = 'data/progress') {
    this.dataPath = dataPath;
    this.ensureDataDirectory();
    logger.info(`ProgressTracker initialized with data path: ${this.dataPath}`);
  }

  private ensureDataDirectory(): void {
    if (!existsSync(this.dataPath)) {
      mkdirSync(this.dataPath, { recursive: true });
    }
  }

  /**
   * Create or get learner profile
   */
  async createLearnerProfile(data: {
    name: string;
    email?: string;
    preferences?: Partial<LearnerProfile['learning_preferences']>;
  }): Promise<LearnerProfile> {
    const id = `learner_${Date.now()}`;
    
    const profile: LearnerProfile = {
      id,
      name: data.name,
      email: data.email,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      learning_preferences: {
        pace: 'moderate',
        difficulty_preference: 'beginner',
        preferred_topics: ['fees', 'wallets'],
        learning_style: 'mixed',
        ...data.preferences
      },
      current_streak: 0,
      total_study_time_minutes: 0,
      achievements: []
    };

    await this.saveProfile(profile);
    logger.info(`Created learner profile: ${profile.id} (${profile.name})`);
    return profile;
  }

  /**
   * Update lesson progress
   */
  async updateLessonProgress(
    learnerId: string, 
    tutorialId: string,
    lessonId: string,
    update: Partial<LessonProgress>
  ): Promise<void> {
    const progressFile = join(this.dataPath, `${learnerId}_lessons.json`);
    const allProgress: LessonProgress[] = this.loadJSON(progressFile, []);
    
    const existingIndex = allProgress.findIndex(p => 
      p.lesson_id === lessonId && p.tutorial_id === tutorialId
    );

    const updatedProgress: LessonProgress = {
      lesson_id: lessonId,
      tutorial_id: tutorialId,
      status: 'not_started',
      time_spent_minutes: 0,
      objectives_completed: [],
      ...update
    };

    if (existingIndex >= 0) {
      // Merge with existing progress
      allProgress[existingIndex] = {
        ...allProgress[existingIndex],
        ...updatedProgress
      };
    } else {
      allProgress.push(updatedProgress);
    }

    writeFileSync(progressFile, JSON.stringify(allProgress, null, 2));
    
    // Update study time and check achievements
    await this.updateProfileActivity(learnerId, update.time_spent_minutes || 0);
    await this.checkAndAwardAchievements(learnerId);

    logger.info(`Updated lesson progress: ${learnerId} - ${tutorialId}/${lessonId} - ${update.status}`);
  }

  /**
   * Record assessment attempt
   */
  async recordAssessmentAttempt(attempt: Omit<AssessmentAttempt, 'attempt_id'>): Promise<string> {
    const attemptId = `attempt_${Date.now()}`;
    const fullAttempt: AssessmentAttempt = {
      attempt_id: attemptId,
      ...attempt
    };

    const attemptsFile = join(this.dataPath, `${attempt.learner_id}_assessments.json`);
    const allAttempts: AssessmentAttempt[] = this.loadJSON(attemptsFile, []);
    allAttempts.push(fullAttempt);
    
    writeFileSync(attemptsFile, JSON.stringify(allAttempts, null, 2));
    
    // Update profile and check achievements
    await this.updateProfileActivity(attempt.learner_id, attempt.time_taken_minutes);
    await this.checkAndAwardAchievements(attempt.learner_id);

    logger.info(`Recorded assessment attempt: ${attemptId} - Score: ${attempt.score}/${attempt.total_points} (${attempt.percentage}%)`);
    return attemptId;
  }

  /**
   * Start a study session
   */
  async startStudySession(learnerId: string, goals: string[] = []): Promise<string> {
    const sessionId = `session_${Date.now()}`;
    const session: StudySession = {
      id: sessionId,
      learner_id: learnerId,
      started_at: new Date().toISOString(),
      activities: [],
      total_time_minutes: 0,
      topics_covered: [],
      goals_set: goals,
      goals_achieved: []
    };

    const sessionsFile = join(this.dataPath, `${learnerId}_sessions.json`);
    const allSessions: StudySession[] = this.loadJSON(sessionsFile, []);
    allSessions.push(session);
    
    writeFileSync(sessionsFile, JSON.stringify(allSessions, null, 2));
    cacheStore.set(`current_session_${learnerId}`, sessionId, 24 * 60 * 60 * 1000); // 24 hours

    logger.info(`Started study session: ${sessionId} for learner ${learnerId}`);
    return sessionId;
  }

  /**
   * End study session
   */
  async endStudySession(learnerId: string): Promise<StudySession | null> {
    const currentSessionId = cacheStore.get(`current_session_${learnerId}`);
    if (!currentSessionId) return null;

    const sessionsFile = join(this.dataPath, `${learnerId}_sessions.json`);
    const allSessions: StudySession[] = this.loadJSON(sessionsFile, []);
    const sessionIndex = allSessions.findIndex(s => s.id === currentSessionId);
    
    if (sessionIndex >= 0) {
      allSessions[sessionIndex].ended_at = new Date().toISOString();
      allSessions[sessionIndex].total_time_minutes = allSessions[sessionIndex].activities
        .reduce((total, activity) => total + activity.time_spent_minutes, 0);
      
      writeFileSync(sessionsFile, JSON.stringify(allSessions, null, 2));
      cacheStore.delete(`current_session_${learnerId}`);
      
      logger.info(`Ended study session: ${currentSessionId} - Total time: ${allSessions[sessionIndex].total_time_minutes} minutes`);
      return allSessions[sessionIndex];
    }

    return null;
  }

  /**
   * Generate progress analytics
   */
  async generateProgressAnalytics(learnerId: string): Promise<ProgressAnalytics> {
    const profile = await this.getProfile(learnerId);
    if (!profile) throw new Error(`Learner profile not found: ${learnerId}`);

    const lessonProgress = this.getLessonProgress(learnerId);
    const assessmentAttempts = this.getAssessmentAttempts(learnerId);
    const sessions = this.getStudySessions(learnerId);

    // Calculate topic mastery
    const topicMastery: { [topic: string]: number } = {};
    const topics = ['fees', 'mining', 'wallets', 'scaling', 'security'];
    
    for (const topic of topics) {
      const topicAssessments = assessmentAttempts.filter(a => 
        a.assessment_id.toLowerCase().includes(topic)
      );
      const topicLessons = lessonProgress.filter(p => 
        p.tutorial_id.toLowerCase().includes(topic)
      );
      
      if (topicAssessments.length > 0 || topicLessons.length > 0) {
        const assessmentScore = topicAssessments.length > 0 
          ? Math.max(...topicAssessments.map(a => a.percentage))
          : 0;
        const lessonCompletion = topicLessons.length > 0
          ? (topicLessons.filter(l => l.status === 'completed').length / topicLessons.length) * 100
          : 0;
        
        topicMastery[topic] = Math.round((assessmentScore * 0.7) + (lessonCompletion * 0.3));
      }
    }

    // Calculate learning velocity
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.started_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate >= weekAgo;
    });

    const lessonsThisWeek = lessonProgress.filter(p => {
      if (!p.completed_at) return false;
      const completionDate = new Date(p.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completionDate >= weekAgo;
    }).length;

    // Generate recommendations
    const recommendations = this.generateRecommendations(profile, lessonProgress, assessmentAttempts, topicMastery);

    const analytics: ProgressAnalytics = {
      learner_id: learnerId,
      generated_at: new Date().toISOString(),
      overall_progress: {
        tutorials_completed: lessonProgress.filter(p => p.status === 'completed').length,
        assessments_passed: assessmentAttempts.filter(a => a.passed).length,
        total_study_time_hours: Math.round(profile.total_study_time_minutes / 60 * 100) / 100,
        current_streak_days: profile.current_streak,
        mastery_level: this.calculateMasteryLevel(topicMastery, lessonProgress, assessmentAttempts)
      },
      topic_mastery: topicMastery,
      learning_velocity: {
        lessons_per_week: lessonsThisWeek,
        improvement_trend: this.calculateImprovementTrend(assessmentAttempts)
      },
      recommendations,
      strengths: this.identifyStrengths(topicMastery, assessmentAttempts),
      areas_for_improvement: this.identifyAreasForImprovement(topicMastery, assessmentAttempts)
    };

    // Cache analytics for 1 hour
    cacheStore.set(`analytics_${learnerId}`, analytics, 60 * 60 * 1000);
    return analytics;
  }

  /**
   * Get learning path recommendations
   */
  async recommendLearningPath(learnerId: string): Promise<LearningPath[]> {
    const analytics = await this.generateProgressAnalytics(learnerId);
    const profile = await this.getProfile(learnerId);
    
    const paths: LearningPath[] = [];

    // Beginner path
    if (analytics.overall_progress.mastery_level === 'novice' || analytics.overall_progress.mastery_level === 'beginner') {
      paths.push({
        id: 'bitcoin_foundations',
        title: 'Bitcoin Foundations',
        description: 'Master the fundamentals of Bitcoin, from basic concepts to practical usage',
        estimated_duration_hours: 12,
        difficulty_level: 'beginner',
        prerequisites: [],
        modules: [
          { tutorial_id: 'bitcoin-basics', required: true, estimated_duration_minutes: 60 },
          { tutorial_id: 'transaction-fees', required: true, estimated_duration_minutes: 80 },
          { tutorial_id: 'wallets-security', required: true, estimated_duration_minutes: 90 }
        ],
        completion_rate: this.calculatePathCompletion(['bitcoin-basics', 'transaction-fees', 'wallets-security'], analytics)
      });
    }

    // Intermediate/Advanced paths based on interests
    if (analytics.topic_mastery.fees >= 70) {
      paths.push({
        id: 'advanced_fees',
        title: 'Advanced Fee Management',
        description: 'Master sophisticated fee strategies and optimization techniques',
        estimated_duration_hours: 8,
        difficulty_level: 'advanced',
        prerequisites: ['bitcoin-basics', 'transaction-fees'],
        modules: [
          { tutorial_id: 'fee-optimization', required: true, estimated_duration_minutes: 120 },
          { tutorial_id: 'lightning-network', required: false, estimated_duration_minutes: 150 },
          { tutorial_id: 'batching-strategies', required: false, estimated_duration_minutes: 90 }
        ],
        completion_rate: 0
      });
    }

    return paths;
  }

  // Helper methods
  private async saveProfile(profile: LearnerProfile): Promise<void> {
    const profileFile = join(this.dataPath, `${profile.id}_profile.json`);
    writeFileSync(profileFile, JSON.stringify(profile, null, 2));
  }

  private async getProfile(learnerId: string): Promise<LearnerProfile | null> {
    const profileFile = join(this.dataPath, `${learnerId}_profile.json`);
    return this.loadJSON(profileFile, null);
  }

  private loadJSON<T>(filePath: string, defaultValue: T): T {
    try {
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf8');
        return JSON.parse(content);
      }
    } catch (error) {
      logger.warn(`Failed to load JSON from ${filePath}:`, error);
    }
    return defaultValue;
  }

  private getLessonProgress(learnerId: string): LessonProgress[] {
    const progressFile = join(this.dataPath, `${learnerId}_lessons.json`);
    return this.loadJSON(progressFile, []);
  }

  private getAssessmentAttempts(learnerId: string): AssessmentAttempt[] {
    const attemptsFile = join(this.dataPath, `${learnerId}_assessments.json`);
    return this.loadJSON(attemptsFile, []);
  }

  private getStudySessions(learnerId: string): StudySession[] {
    const sessionsFile = join(this.dataPath, `${learnerId}_sessions.json`);
    return this.loadJSON(sessionsFile, []);
  }

  private async updateProfileActivity(learnerId: string, timeSpentMinutes: number): Promise<void> {
    const profile = await this.getProfile(learnerId);
    if (!profile) return;

    profile.total_study_time_minutes += timeSpentMinutes;
    profile.last_active = new Date().toISOString();
    
    // Update streak logic (simplified)
    const today = new Date().toDateString();
    const lastActive = new Date(profile.last_active).toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActive === today) {
      // Same day, no streak change
    } else if (lastActive === yesterday.toDateString()) {
      profile.current_streak += 1;
    } else {
      profile.current_streak = 1; // Reset streak
    }

    await this.saveProfile(profile);
  }

  private async checkAndAwardAchievements(learnerId: string): Promise<void> {
    const profile = await this.getProfile(learnerId);
    if (!profile) return;

    const lessonProgress = this.getLessonProgress(learnerId);
    const assessmentAttempts = this.getAssessmentAttempts(learnerId);

    const earnedAchievementIds = new Set(profile.achievements.map(a => a.id));
    
    for (const achievement of this.achievements) {
      if (!earnedAchievementIds.has(achievement.id)) {
        const shouldAward = achievement.check(profile, lessonProgress, assessmentAttempts);
        if (shouldAward) {
          const newAchievement: Achievement = {
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            earned_at: new Date().toISOString(),
            category: achievement.category as any,
            requirements_met: [`Completed ${achievement.description.toLowerCase()}`]
          };
          
          profile.achievements.push(newAchievement);
          logger.info(`🎉 Achievement earned: ${learnerId} - ${achievement.title}`);
        }
      }
    }

    await this.saveProfile(profile);
  }

  private generateRecommendations(
    profile: LearnerProfile, 
    lessons: LessonProgress[], 
    assessments: AssessmentAttempt[], 
    topicMastery: { [topic: string]: number }
  ): string[] {
    const recommendations = [];

    // Study frequency recommendations
    if (profile.current_streak < 3) {
      recommendations.push('Try to maintain a consistent daily study routine to improve retention');
    }

    // Topic-specific recommendations
    const weakTopics = Object.entries(topicMastery)
      .filter(([_, score]) => score < 50)
      .map(([topic, _]) => topic);
    
    if (weakTopics.length > 0) {
      recommendations.push(`Focus on strengthening your understanding of: ${weakTopics.join(', ')}`);
    }

    // Assessment performance
    const recentFailures = assessments
      .slice(-5)
      .filter(a => !a.passed);
    
    if (recentFailures.length > 2) {
      recommendations.push('Consider reviewing lesson materials before attempting assessments');
    }

    // Pacing recommendations
    const avgStudyTime = profile.total_study_time_minutes / Math.max(1, lessons.filter(l => l.status === 'completed').length);
    if (avgStudyTime > 45) {
      recommendations.push('Try breaking study sessions into shorter, more focused intervals');
    }

    return recommendations;
  }

  private calculateMasteryLevel(
    topicMastery: { [topic: string]: number }, 
    lessons: LessonProgress[], 
    assessments: AssessmentAttempt[]
  ): ProgressAnalytics['overall_progress']['mastery_level'] {
    const averageMastery = Object.values(topicMastery).reduce((sum, score) => sum + score, 0) / Object.values(topicMastery).length;
    const completedLessons = lessons.filter(l => l.status === 'completed').length;
    const passedAssessments = assessments.filter(a => a.passed).length;

    if (averageMastery >= 90 && completedLessons >= 15 && passedAssessments >= 8) return 'expert';
    if (averageMastery >= 80 && completedLessons >= 10 && passedAssessments >= 5) return 'advanced';
    if (averageMastery >= 60 && completedLessons >= 6 && passedAssessments >= 3) return 'intermediate';
    if (averageMastery >= 40 && completedLessons >= 3 && passedAssessments >= 1) return 'beginner';
    return 'novice';
  }

  private calculateImprovementTrend(assessments: AssessmentAttempt[]): 'improving' | 'stable' | 'declining' {
    if (assessments.length < 3) return 'stable';
    
    const recent = assessments.slice(-3);
    const older = assessments.slice(-6, -3);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, a) => sum + a.percentage, 0) / recent.length;
    const olderAvg = older.reduce((sum, a) => sum + a.percentage, 0) / older.length;
    
    if (recentAvg > olderAvg + 5) return 'improving';
    if (recentAvg < olderAvg - 5) return 'declining';
    return 'stable';
  }

  private identifyStrengths(topicMastery: { [topic: string]: number }, assessments: AssessmentAttempt[]): string[] {
    const strengths = [];
    
    // Topic strengths
    const strongTopics = Object.entries(topicMastery)
      .filter(([_, score]) => score >= 80)
      .map(([topic, _]) => `Strong understanding of ${topic}`);
    strengths.push(...strongTopics);
    
    // Performance patterns
    const highScores = assessments.filter(a => a.percentage >= 90);
    if (highScores.length >= 3) {
      strengths.push('Consistently achieves high assessment scores');
    }
    
    const quickCompletion = assessments.filter(a => a.time_taken_minutes < 30);
    if (quickCompletion.length >= 2) {
      strengths.push('Efficient problem-solving and quick comprehension');
    }

    return strengths;
  }

  private identifyAreasForImprovement(topicMastery: { [topic: string]: number }, assessments: AssessmentAttempt[]): string[] {
    const improvements = [];
    
    // Topic weaknesses
    const weakTopics = Object.entries(topicMastery)
      .filter(([_, score]) => score < 60)
      .map(([topic, _]) => `Needs improvement in ${topic} concepts`);
    improvements.push(...weakTopics);
    
    // Performance patterns
    const lowScores = assessments.filter(a => a.percentage < 70);
    if (lowScores.length >= 2) {
      improvements.push('Review study strategies and consider additional practice');
    }
    
    return improvements;
  }

  private calculatePathCompletion(tutorialIds: string[], analytics: ProgressAnalytics): number {
    // Simplified completion calculation
    const relevantProgress = analytics.overall_progress.tutorials_completed;
    const totalRequired = tutorialIds.length;
    return Math.round((relevantProgress / totalRequired) * 100);
  }
}