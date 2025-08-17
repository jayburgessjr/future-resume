import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResumeParams {
  mode: 'concise' | 'detailed' | 'executive';
  voice: 'first-person' | 'third-person';
  format: 'markdown' | 'plain_text' | 'json';
  includeTable: boolean;
  proofread: boolean;
  resumeContent: string;
  jobDescription: string;
  manualEntry?: string;
}

interface ResumeOutput {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: ResumeParams = await req.json();
    console.log('Starting resume generation with params:', { 
      mode: params.mode, 
      voice: params.voice, 
      format: params.format 
    });

    const result = await generateResumeFlow(params);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-resume function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateResumeFlow(params: ResumeParams): Promise<ResumeOutput> {
  /* 
  <!-- AI REASONING: 7-Phase Resume Generation Process
  Phase 1: Core Competency Extraction
  Phase 2: Company Signal Analysis  
  Phase 3: Resume Rewriting & Optimization
  Phase 4: Rapid Review Loop (1-5 scoring)
  Phase 5: Final Output Generation
  Phase 6: Deliverables Creation
  Phase 7: Grammar & Readability Check
  -->
  */

  console.log('<!-- Phase 1: Core Competency Extraction -->');
  const coreCompetencies = await extractCoreCompetencies(params.jobDescription, params.resumeContent);
  
  console.log('<!-- Phase 2: Company Signal Analysis -->');
  const companySignals = await analyzeCompanySignals(params.jobDescription);
  
  console.log('<!-- Phase 3: Resume Rewriting & Optimization -->');
  const optimizedResume = await optimizeResume(params, coreCompetencies, companySignals);
  
  console.log('<!-- Phase 4: Rapid Review Loop -->');
  const reviewScore = await rapidReviewLoop(optimizedResume, params.jobDescription);
  
  console.log('<!-- Phase 5: Final Output Generation -->');
  const finalResume = await generateFinalResume(optimizedResume, params, reviewScore);
  
  console.log('<!-- Phase 6: Deliverables Creation -->');
  const deliverables = await createDeliverables(finalResume, params, coreCompetencies);
  
  console.log('<!-- Phase 7: Grammar & Readability Check -->');
  const grammarScore = params.proofread ? await checkGrammarAndReadability(finalResume) : undefined;

  return {
    finalResume,
    coverLetter: deliverables.coverLetter,
    recruiterHighlights: deliverables.recruiterHighlights,
    interviewToolkit: deliverables.interviewToolkit,
    weeklyKPITracker: deliverables.weeklyKPITracker,
    grammarScore,
    metadata: {
      phase: 'Complete',
      optimizationScore: reviewScore,
      keywordsMatched: coreCompetencies.length,
      wordCount: finalResume.split(' ').length
    }
  };
}

async function extractCoreCompetencies(jobDescription: string, resumeContent: string): Promise<string[]> {
  const prompt = `
    <!-- SYSTEM: Expert Resume Coach with 40+ years experience -->
    <!-- TASK: Extract core competencies and skills from job description -->
    <!-- OUTPUT: Array of 10-15 key competencies that match candidate's background -->
    
    Job Description:
    ${jobDescription}
    
    Current Resume:
    ${resumeContent}
    
    Extract the top 10-15 core competencies from the job description that align with the candidate's existing experience.
    Focus on hard skills, certifications, technologies, and specific methodologies mentioned.
    Return as a JSON array of strings.
  `;

  const response = await callOpenAI(prompt, 'gpt-5-mini-2025-08-07');
  try {
    return JSON.parse(response);
  } catch {
    return response.split('\n').filter(line => line.trim()).slice(0, 15);
  }
}

async function analyzeCompanySignals(jobDescription: string): Promise<{ culture: string[]; values: string[]; priorities: string[] }> {
  const prompt = `
    <!-- SYSTEM: Expert Company Culture Analyst -->
    <!-- TASK: Identify company culture, values, and business priorities -->
    <!-- OUTPUT: JSON object with culture, values, and priorities arrays -->
    
    Job Description:
    ${jobDescription}
    
    Analyze this job description to extract:
    1. Company culture signals (collaborative, innovative, fast-paced, etc.)
    2. Core values (customer-focused, integrity, excellence, etc.) 
    3. Business priorities (growth, efficiency, quality, etc.)
    
    Return as JSON: {"culture": [], "values": [], "priorities": []}
  `;

  const response = await callOpenAI(prompt, 'gpt-5-mini-2025-08-07');
  try {
    return JSON.parse(response);
  } catch {
    return { culture: [], values: [], priorities: [] };
  }
}

async function optimizeResume(
  params: ResumeParams, 
  competencies: string[], 
  signals: { culture: string[]; values: string[]; priorities: string[] }
): Promise<string> {
  const voiceInstructions = params.voice === 'first-person' 
    ? "Use first-person voice (I, my, me)" 
    : "Use third-person voice (candidate, they, their)";
    
  const modeInstructions = {
    concise: "Keep bullets under 20 words. Focus on quantifiable results. Maximum 350 words total.",
    detailed: "Provide comprehensive bullets with context, action, and results. Maximum 550 words total.",
    executive: "Emphasize leadership, strategic initiatives, and organizational impact. Maximum 450 words total."
  }[params.mode];

  const prompt = `
    <!-- SYSTEM: Expert ATS Resume Writer with 40+ years experience -->
    <!-- TASK: Rewrite resume to optimize for ATS and human reviewers -->
    <!-- GREATNESS CHECK: Score 1-5 on keyword optimization, impact quantification, and readability -->
    
    VOICE: ${voiceInstructions}
    MODE: ${modeInstructions}
    
    Core Competencies to Include: ${competencies.join(', ')}
    Company Culture Signals: ${signals.culture.join(', ')}
    Company Values: ${signals.values.join(', ')}
    Business Priorities: ${signals.priorities.join(', ')}
    
    Original Resume:
    ${params.resumeContent || params.manualEntry}
    
    Target Job Description:
    ${params.jobDescription}
    
    Rewrite this resume to:
    1. Include ALL relevant competencies naturally
    2. Align with company culture and values
    3. Quantify achievements with metrics where possible
    4. Use power verbs and industry keywords
    5. Ensure ATS compatibility with standard formatting
    
    <!-- OPTIMIZATION LOOP: Reviewing for keyword density, impact clarity, and ATS compliance -->
    
    ${params.includeTable ? "Include a skills table at the end with technical competencies." : ""}
  `;

  return await callOpenAI(prompt, 'gpt-5-2025-08-07');
}

async function rapidReviewLoop(resume: string, jobDescription: string): Promise<number> {
  const prompt = `
    <!-- SYSTEM: Resume Quality Assessor -->
    <!-- TASK: Score resume optimization on 1-5 scale -->
    <!-- CRITERIA: Keyword alignment, impact quantification, ATS compatibility, readability -->
    
    Resume:
    ${resume}
    
    Job Description:
    ${jobDescription}
    
    Rate this resume on a scale of 1-5 (5 = excellent) based on:
    - Keyword alignment with job requirements
    - Quantified achievements and impact
    - ATS compatibility and formatting
    - Overall readability and flow
    
    Return only the numeric score (1-5).
  `;

  const response = await callOpenAI(prompt, 'gpt-5-mini-2025-08-07');
  const score = parseInt(response.trim());
  return isNaN(score) ? 3 : Math.max(1, Math.min(5, score));
}

async function generateFinalResume(optimizedResume: string, params: ResumeParams, reviewScore: number): Promise<string> {
  if (reviewScore >= 4) {
    // High score - format according to user preference
    return formatOutput(optimizedResume, params.format);
  }
  
  // Low score - run one more optimization pass
  const prompt = `
    <!-- SYSTEM: Final Resume Polish Expert -->
    <!-- TASK: Final optimization pass for resume scoring below 4/5 -->
    <!-- FOCUS: Strengthen weak areas identified in review -->
    
    Resume needing improvement (Score: ${reviewScore}/5):
    ${optimizedResume}
    
    Apply final polish focusing on:
    1. Stronger action verbs
    2. More specific quantifiable metrics
    3. Better keyword integration
    4. Improved readability and flow
    
    Maximum word count: ${params.mode === 'concise' ? 350 : params.mode === 'detailed' ? 550 : 450}
  `;

  const polishedResume = await callOpenAI(prompt, 'gpt-5-2025-08-07');
  return formatOutput(polishedResume, params.format);
}

async function createDeliverables(
  finalResume: string, 
  params: ResumeParams, 
  competencies: string[]
): Promise<{
  coverLetter: string;
  recruiterHighlights: string[];
  interviewToolkit: {
    questions: string[];
    followUpEmail: string;
    skillGaps: string[];
  };
  weeklyKPITracker: string;
}> {
  // Cover Letter Generation
  const coverLetterPrompt = `
    <!-- SYSTEM: Executive Cover Letter Writer -->
    <!-- TASK: Create compelling cover letter under 250 words -->
    
    Resume:
    ${finalResume}
    
    Job Description:
    ${params.jobDescription}
    
    Write a compelling cover letter that:
    1. Opens with specific connection to the role
    2. Highlights 2-3 key achievements from resume
    3. Shows understanding of company needs
    4. Closes with confident next steps
    
    Maximum 250 words. Professional and engaging tone.
  `;

  const recruiterHighlightsPrompt = `
    <!-- SYSTEM: Recruiter Brief Creator -->
    <!-- TASK: Create 5 bullet points that make recruiter excited -->
    
    Resume:
    ${finalResume}
    
    Create 5 compelling bullet points that a recruiter can quickly scan:
    1. Quantifiable achievements
    2. Relevant experience highlights  
    3. Key skills alignment
    4. Notable accomplishments
    5. Value proposition
    
    Each bullet should be under 15 words and include metrics where possible.
    Return as JSON array of strings.
  `;

  const interviewToolkitPrompt = `
    <!-- SYSTEM: Interview Preparation Expert -->
    <!-- TASK: Create comprehensive interview preparation toolkit -->
    
    Resume:
    ${finalResume}
    
    Job Description:
    ${params.jobDescription}
    
    Create:
    1. 5 likely interview questions based on job requirements
    2. Follow-up email template for after the interview
    3. 3 potential skill gaps to address/improve
    
    Return as JSON: {"questions": [], "followUpEmail": "string", "skillGaps": []}
  `;

  const kpiTrackerPrompt = `
    <!-- SYSTEM: Career Development Strategist -->
    <!-- TASK: Create weekly KPI tracker for job search -->
    
    Based on this role pursuit, create a weekly KPI tracking template with:
    1. Application metrics
    2. Networking activities
    3. Skill development goals
    4. Interview preparation tasks
    5. Follow-up actions
    
    Format as actionable weekly checklist.
  `;

  const [coverLetter, recruiterHighlights, interviewToolkit, weeklyKPITracker] = await Promise.all([
    callOpenAI(coverLetterPrompt, 'gpt-4.1-2025-04-14'),
    callOpenAI(recruiterHighlightsPrompt, 'gpt-4.1-2025-04-14'),
    callOpenAI(interviewToolkitPrompt, 'gpt-4.1-2025-04-14'),
    callOpenAI(kpiTrackerPrompt, 'gpt-4.1-2025-04-14')
  ]);

  let parsedHighlights: string[];
  let parsedToolkit: any;

  try {
    parsedHighlights = JSON.parse(recruiterHighlights);
  } catch {
    parsedHighlights = recruiterHighlights.split('\n').filter(line => line.trim()).slice(0, 5);
  }

  try {
    parsedToolkit = JSON.parse(interviewToolkit);
  } catch {
    parsedToolkit = {
      questions: ["Tell me about yourself", "Why are you interested in this role?", "What are your strengths?"],
      followUpEmail: "Template follow-up email",
      skillGaps: ["Technical skill enhancement", "Industry knowledge", "Soft skills development"]
    };
  }

  return {
    coverLetter,
    recruiterHighlights: parsedHighlights,
    interviewToolkit: parsedToolkit,
    weeklyKPITracker
  };
}

async function checkGrammarAndReadability(text: string): Promise<number> {
  const prompt = `
    <!-- SYSTEM: Grammar and Readability Analyzer -->
    <!-- TASK: Calculate Flesch Reading Ease score and check grammar -->
    
    Text to analyze:
    ${text}
    
    Provide a readability score from 0-100 (Flesch Reading Ease scale):
    - 90-100: Very Easy
    - 80-89: Easy  
    - 70-79: Fairly Easy
    - 60-69: Standard
    - 50-59: Fairly Difficult
    - 30-49: Difficult
    - 0-29: Very Difficult
    
    Return only the numeric score (0-100).
  `;

  const response = await callOpenAI(prompt, 'gpt-5-mini-2025-08-07');
  const score = parseInt(response.trim());
  return isNaN(score) ? 65 : Math.max(0, Math.min(100, score));
}

function formatOutput(content: string, format: 'markdown' | 'plain_text' | 'json'): string {
  switch (format) {
    case 'json':
      return JSON.stringify({ resume: content }, null, 2);
    case 'markdown':
      return content; // Already in markdown format from AI
    case 'plain_text':
    default:
      // Strip markdown formatting for plain text
      return content
        .replace(/#{1,6}\s*/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1');
  }
}

async function callOpenAI(prompt: string, model: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const isNewModel = model.includes('gpt-5') || model.includes('gpt-4.1') || model.includes('o3') || model.includes('o4');
  
  const requestBody: any = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: isNewModel ? 1500 : undefined,
    max_tokens: isNewModel ? undefined : 1500,
  };

  // Only add temperature for legacy models
  if (!isNewModel) {
    requestBody.temperature = 0.7;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}