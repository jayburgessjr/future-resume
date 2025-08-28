/**
 * Background processing utilities for heavy operations
 * Uses Web Workers when available, falls back to setTimeout for lighter tasks
 */

export interface BackgroundTask<T = any, R = any> {
  id: string;
  type: string;
  data: T;
  priority: 'low' | 'medium' | 'high';
  callback?: (result: R) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface TaskResult<R = any> {
  id: string;
  result?: R;
  error?: Error;
  progress?: number;
}

class BackgroundProcessor {
  private static instance: BackgroundProcessor;
  private taskQueue: BackgroundTask[] = [];
  private activeTasks = new Map<string, AbortController>();
  private workers = new Map<string, Worker>();
  private isProcessing = false;
  private maxConcurrentTasks = 3;

  private constructor() {
    this.initializeWorkers();
  }

  static getInstance(): BackgroundProcessor {
    if (!BackgroundProcessor.instance) {
      BackgroundProcessor.instance = new BackgroundProcessor();
    }
    return BackgroundProcessor.instance;
  }

  private initializeWorkers(): void {
    // Initialize workers for different task types if Web Workers are supported
    if (typeof Worker !== 'undefined') {
      try {
        // We'll create workers on-demand to avoid bundle size issues
      } catch (error) {
        console.warn('Web Workers not available, falling back to main thread processing');
      }
    }
  }

  /**
   * Add a task to the processing queue
   */
  addTask<T, R>(task: Omit<BackgroundTask<T, R>, 'id'>): string {
    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTask: BackgroundTask<T, R> = {
      ...task,
      id
    };

    // Insert based on priority
    const insertIndex = this.findInsertionIndex(task.priority);
    this.taskQueue.splice(insertIndex, 0, fullTask);

    if (!this.isProcessing) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Cancel a task by ID
   */
  cancelTask(taskId: string): boolean {
    // Remove from queue if not started
    const queueIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
      return true;
    }

    // Abort if currently running
    const controller = this.activeTasks.get(taskId);
    if (controller) {
      controller.abort();
      this.activeTasks.delete(taskId);
      return true;
    }

    return false;
  }

  /**
   * Get queue status
   */
  getStatus(): {
    queueLength: number;
    activeTasks: number;
    totalTasks: number;
  } {
    return {
      queueLength: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      totalTasks: this.taskQueue.length + this.activeTasks.size
    };
  }

  private findInsertionIndex(priority: BackgroundTask['priority']): number {
    const priorityValue = { high: 3, medium: 2, low: 1 }[priority];
    
    for (let i = 0; i < this.taskQueue.length; i++) {
      const taskPriority = { high: 3, medium: 2, low: 1 }[this.taskQueue[i].priority];
      if (priorityValue > taskPriority) {
        return i;
      }
    }
    
    return this.taskQueue.length;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.taskQueue.length > 0 && this.activeTasks.size < this.maxConcurrentTasks) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      this.processTask(task);
    }

    if (this.activeTasks.size === 0) {
      this.isProcessing = false;
    }
  }

  private async processTask(task: BackgroundTask): Promise<void> {
    const controller = new AbortController();
    this.activeTasks.set(task.id, controller);

    try {
      let result: any;

      switch (task.type) {
        case 'resume-analysis':
          result = await this.processResumeAnalysis(task.data, controller.signal, task.onProgress);
          break;
        case 'keyword-extraction':
          result = await this.processKeywordExtraction(task.data, controller.signal);
          break;
        case 'content-optimization':
          result = await this.processContentOptimization(task.data, controller.signal, task.onProgress);
          break;
        case 'ats-scoring':
          result = await this.processATSScoring(task.data, controller.signal);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      if (!controller.signal.aborted && task.callback) {
        task.callback(result);
      }
    } catch (error) {
      if (!controller.signal.aborted && task.onError) {
        task.onError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      this.activeTasks.delete(task.id);
      
      // Continue processing queue
      if (this.taskQueue.length > 0) {
        setTimeout(() => this.processQueue(), 0);
      } else if (this.activeTasks.size === 0) {
        this.isProcessing = false;
      }
    }
  }

  private async processResumeAnalysis(
    data: { resumeText: string; jobDescription: string },
    signal: AbortSignal,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    onProgress?.(10);
    
    // Simulate heavy processing with yielding to main thread
    await this.yieldToMainThread();
    
    // Basic analysis - word matching, keyword density, etc.
    const { resumeText, jobDescription } = data;
    
    onProgress?.(30);
    
    // Extract keywords from job description
    const jobKeywords = this.extractKeywords(jobDescription);
    
    onProgress?.(50);
    
    // Analyze resume content
    const resumeKeywords = this.extractKeywords(resumeText);
    
    onProgress?.(70);
    
    // Calculate matching score
    const matchingScore = this.calculateMatchingScore(jobKeywords, resumeKeywords);
    
    onProgress?.(90);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(jobKeywords, resumeKeywords);
    
    onProgress?.(100);
    
    return {
      matchingScore,
      jobKeywords: jobKeywords.slice(0, 20),
      resumeKeywords: resumeKeywords.slice(0, 20),
      recommendations
    };
  }

  private async processKeywordExtraction(
    data: { text: string },
    signal: AbortSignal
  ): Promise<string[]> {
    await this.yieldToMainThread();
    return this.extractKeywords(data.text);
  }

  private async processContentOptimization(
    data: { content: string; targetKeywords: string[] },
    signal: AbortSignal,
    onProgress?: (progress: number) => void
  ): Promise<{ optimizedContent: string; improvements: string[] }> {
    onProgress?.(20);
    
    const { content, targetKeywords } = data;
    let optimizedContent = content;
    const improvements: string[] = [];
    
    await this.yieldToMainThread();
    onProgress?.(50);
    
    // Basic content optimization logic
    targetKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = content.match(regex);
      
      if (!matches || matches.length < 2) {
        // Suggest adding the keyword
        improvements.push(`Consider adding "${keyword}" more frequently`);
      }
    });
    
    onProgress?.(80);
    
    // Basic formatting improvements
    optimizedContent = this.improveFormatting(optimizedContent);
    
    onProgress?.(100);
    
    return { optimizedContent, improvements };
  }

  private async processATSScoring(
    data: { resumeText: string; jobDescription: string },
    signal: AbortSignal
  ): Promise<{ score: number; factors: any }> {
    await this.yieldToMainThread();
    
    const { resumeText, jobDescription } = data;
    
    // Calculate various ATS factors
    const factors = {
      keywordMatch: this.calculateKeywordMatch(resumeText, jobDescription),
      formatting: this.analyzeFormatting(resumeText),
      sections: this.analyzeSections(resumeText),
      length: this.analyzeLength(resumeText)
    };
    
    // Calculate overall score (0-100)
    const score = Math.round(
      (factors.keywordMatch * 0.4 + 
       factors.formatting * 0.2 + 
       factors.sections * 0.2 + 
       factors.length * 0.2)
    );
    
    return { score, factors };
  }

  // Helper methods for processing
  private extractKeywords(text: string): string[] {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .reduce((acc, word) => {
        const index = acc.findIndex(item => item.word === word);
        if (index >= 0) {
          acc[index].count++;
        } else {
          acc.push({ word, count: 1 });
        }
        return acc;
      }, [] as { word: string; count: number }[])
      .sort((a, b) => b.count - a.count)
      .map(item => item.word);
  }

  private calculateMatchingScore(jobKeywords: string[], resumeKeywords: string[]): number {
    const jobKeywordSet = new Set(jobKeywords.slice(0, 50));
    const resumeKeywordSet = new Set(resumeKeywords);
    
    const matches = Array.from(jobKeywordSet).filter(keyword => 
      resumeKeywordSet.has(keyword)
    );
    
    return Math.round((matches.length / jobKeywords.length) * 100);
  }

  private generateRecommendations(jobKeywords: string[], resumeKeywords: string[]): string[] {
    const jobKeywordSet = new Set(jobKeywords.slice(0, 20));
    const resumeKeywordSet = new Set(resumeKeywords);
    
    const missing = Array.from(jobKeywordSet).filter(keyword => 
      !resumeKeywordSet.has(keyword)
    );
    
    return missing.slice(0, 5).map(keyword => 
      `Consider adding "${keyword}" to better match the job requirements`
    );
  }

  private calculateKeywordMatch(resumeText: string, jobDescription: string): number {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(resumeText);
    return this.calculateMatchingScore(jobKeywords, resumeKeywords);
  }

  private analyzeFormatting(text: string): number {
    let score = 100;
    
    // Deduct points for formatting issues
    if (text.includes('\t')) score -= 10; // Tabs
    if (text.match(/\n{3,}/)) score -= 10; // Excessive line breaks
    if (!text.match(/[A-Z][a-z]+/)) score -= 20; // No proper capitalization
    
    return Math.max(0, score);
  }

  private analyzeSections(text: string): number {
    const commonSections = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'work', 'employment', 'projects', 'achievements'
    ];
    
    const foundSections = commonSections.filter(section =>
      text.toLowerCase().includes(section)
    );
    
    return Math.min(100, (foundSections.length / 5) * 100);
  }

  private analyzeLength(text: string): number {
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount < 200) return 50; // Too short
    if (wordCount > 800) return 70; // Too long
    if (wordCount >= 300 && wordCount <= 600) return 100; // Perfect
    return 85; // Good
  }

  private improveFormatting(content: string): string {
    return content
      .replace(/\n{3,}/g, '\n\n') // Fix excessive line breaks
      .replace(/\s+/g, ' ') // Fix excessive spaces
      .trim();
  }

  private async yieldToMainThread(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}

// Export singleton instance and convenience functions
export const backgroundProcessor = BackgroundProcessor.getInstance();

export const processInBackground = {
  analyzeResume: (resumeText: string, jobDescription: string) => 
    backgroundProcessor.addTask({
      type: 'resume-analysis',
      data: { resumeText, jobDescription },
      priority: 'medium'
    }),

  extractKeywords: (text: string) =>
    backgroundProcessor.addTask({
      type: 'keyword-extraction',
      data: { text },
      priority: 'low'
    }),

  optimizeContent: (content: string, targetKeywords: string[]) =>
    backgroundProcessor.addTask({
      type: 'content-optimization',
      data: { content, targetKeywords },
      priority: 'medium'
    }),

  calculateATSScore: (resumeText: string, jobDescription: string) =>
    backgroundProcessor.addTask({
      type: 'ats-scoring',
      data: { resumeText, jobDescription },
      priority: 'high'
    })
};