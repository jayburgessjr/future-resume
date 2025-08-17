import { supabase } from "@/integrations/supabase/client";

export interface ResumeGenerationParams {
  mode: 'concise' | 'detailed' | 'executive';
  voice: 'first-person' | 'third-person';
  format: 'markdown' | 'plain_text' | 'json';
  includeTable: boolean;
  proofread: boolean;
  resumeContent: string;
  jobDescription: string;
  manualEntry?: string;
}

export interface ResumeGenerationResult {
  finalResume: string;
  coverLetter: string;
  recruiterHighlights: string[];
  interviewToolkit: {
    questions: string[];
    followUpEmail: string;
    skillGaps: string[];
  };
  weeklyKPITracker: string;
  grammarScore?: number;
  metadata: {
    phase: string;
    optimizationScore: number;
    keywordsMatched: number;
    wordCount: number;
  };
}

/**
 * Core resume generation function that orchestrates the 7-phase AI process
 * 
 * Phase Flow:
 * 1. Core Competency Extraction from job description
 * 2. Company Signal Analysis (culture, values, priorities)
 * 3. Resume Rewriting & Optimization with keyword injection
 * 4. Rapid Review Loop (1-5 scoring system)
 * 5. Final Output Generation with format preferences
 * 6. Deliverables Creation (cover letter, highlights, toolkit)
 * 7. Grammar & Readability Check (Flesch score)
 */
export async function generateResumeFlow(params: ResumeGenerationParams): Promise<ResumeGenerationResult> {
  try {
    console.log('Starting AI resume generation with 7-phase process...');
    
    // Call the Supabase Edge Function for AI processing
    const { data, error } = await supabase.functions.invoke('generate-resume', {
      body: params
    });

    if (error) {
      console.error('Resume generation error:', error);
      throw new Error(`Resume generation failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from resume generation');
    }

    console.log('✅ AI resume generation completed successfully');
    return data as ResumeGenerationResult;

  } catch (error) {
    console.error('Error in generateResumeFlow:', error);
    throw error;
  }
}

/**
 * Validate resume generation parameters before processing
 */
export function validateResumeParams(params: Partial<ResumeGenerationParams>): string[] {
  const errors: string[] = [];

  if (!params.mode) {
    errors.push('Resume mode is required (concise, detailed, or executive)');
  }

  if (!params.voice) {
    errors.push('Voice style is required (first-person or third-person)');
  }

  if (!params.format) {
    errors.push('Output format is required (markdown, plain_text, or json)');
  }

  if (!params.resumeContent && !params.manualEntry) {
    errors.push('Resume content is required (either file upload or manual entry)');
  }

  if (!params.jobDescription || params.jobDescription.trim().length < 50) {
    errors.push('Job description is required and must be at least 50 characters');
  }

  return errors;
}

/**
 * Format the final resume output based on user preferences
 */
export function formatResumeOutput(content: string, format: 'markdown' | 'plain_text' | 'json'): string {
  switch (format) {
    case 'json':
      return JSON.stringify({
        resume: content,
        generatedAt: new Date().toISOString(),
        format: 'json'
      }, null, 2);

    case 'plain_text':
      // Strip all markdown formatting
      return content
        .replace(/#{1,6}\s*/g, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
        .replace(/^\s*[-*+]\s+/gm, '• '); // Convert bullets

    case 'markdown':
    default:
      return content;
  }
}

/**
 * Calculate estimated processing time based on resume complexity
 */
export function estimateProcessingTime(resumeLength: number, jobDescLength: number): number {
  // Base time: 30 seconds
  // Additional time based on content length
  const baseTime = 30;
  const resumeFactor = Math.ceil(resumeLength / 1000) * 10;
  const jobFactor = Math.ceil(jobDescLength / 500) * 5;
  
  return Math.min(baseTime + resumeFactor + jobFactor, 120); // Max 2 minutes
}

/**
 * Preview function to show what the AI will optimize
 */
export function generateOptimizationPreview(params: Partial<ResumeGenerationParams>): string {
  const preview = `
🎯 **AI Resume Optimization Preview**

**Mode**: ${params.mode || 'Not set'} - ${getModeDescription(params.mode)}
**Voice**: ${params.voice || 'Not set'} - ${getVoiceDescription(params.voice)}
**Format**: ${params.format || 'Not set'}
**Skills Table**: ${params.includeTable ? 'Yes' : 'No'}
**AI Proofreading**: ${params.proofread ? 'Yes' : 'No'}

**Process Overview**:
1. 🔍 Extract key competencies from job description
2. 🏢 Analyze company culture signals
3. ✍️ Rewrite resume with keyword optimization
4. 📊 Quality review (1-5 scoring)
5. 📄 Generate final resume
6. 📦 Create supporting materials
7. ✅ Grammar & readability check

**Estimated Time**: ${estimateProcessingTime(
    params.resumeContent?.length || params.manualEntry?.length || 0,
    params.jobDescription?.length || 0
  )} seconds
  `;

  return preview;
}

function getModeDescription(mode?: string): string {
  switch (mode) {
    case 'concise': return 'Focused bullets, ≤350 words, quantified results';
    case 'detailed': return 'Comprehensive context, ≤550 words, full story';
    case 'executive': return 'Leadership focus, ≤450 words, strategic impact';
    default: return 'Choose your preferred resume style';
  }
}

function getVoiceDescription(voice?: string): string {
  switch (voice) {
    case 'first-person': return 'I, my, me - personal ownership';
    case 'third-person': return 'Candidate, they, their - professional distance';
    default: return 'Choose your preferred writing style';
  }
}