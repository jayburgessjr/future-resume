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
    console.log('Starting resume generation...');
    
    const params: ResumeParams = await req.json();
    console.log('Received params:', { 
      mode: params.mode, 
      voice: params.voice, 
      format: params.format,
      resumeLength: params.resumeContent?.length || 0,
      jobLength: params.jobDescription?.length || 0
    });

    // Validate inputs
    if (!params.resumeContent?.trim()) {
      throw new Error('Resume content is required');
    }
    if (!params.jobDescription?.trim()) {
      throw new Error('Job description is required');
    }

    const result = await generateResumeFlow(params);
    console.log('Generation completed successfully');

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-resume function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Resume generation failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateResumeFlow(params: ResumeParams): Promise<ResumeOutput> {
  console.log('Starting 7-phase resume generation process...');
  
  try {
    // Phase 1: Core Competency Extraction
    console.log('Phase 1: Extracting core competencies...');
    const coreCompetencies = await extractCoreCompetencies(params.jobDescription, params.resumeContent);
    
    // Phase 2: Company Signal Analysis
    console.log('Phase 2: Analyzing company signals...');
    const companySignals = await analyzeCompanySignals(params.jobDescription);
    
    // Phase 3: Resume Rewriting & Optimization
    console.log('Phase 3: Optimizing resume...');
    const optimizedResume = await optimizeResume(params, coreCompetencies, companySignals);
    
    // Phase 4: Rapid Review Loop
    console.log('Phase 4: Quality review...');
    const reviewScore = await rapidReviewLoop(optimizedResume, params.jobDescription);
    
    // Phase 5: Final Output Generation
    console.log('Phase 5: Generating final resume...');
    const finalResume = await generateFinalResume(optimizedResume, params, reviewScore);
    
    // Phase 6: Deliverables Creation
    console.log('Phase 6: Creating deliverables...');
    const deliverables = await createDeliverables(finalResume, params, coreCompetencies);
    
    // Phase 7: Grammar & Readability Check
    console.log('Phase 7: Grammar check...');
    const grammarScore = params.proofread ? await checkGrammarAndReadability(finalResume) : undefined;

    console.log('All phases completed successfully');

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
  } catch (error) {
    console.error('Error in generateResumeFlow:', error);
    throw new Error(`Resume generation failed: ${error.message}`);
  }
}

async function extractCoreCompetencies(jobDescription: string, resumeContent: string): Promise<string[]> {
  const prompt = `Extract the top 10-15 core competencies from this job description that align with the candidate's existing experience.

Job Description:
${jobDescription}

Current Resume:
${resumeContent}

Focus on hard skills, certifications, technologies, and specific methodologies mentioned.
Return as a simple list, one skill per line.`;

  try {
    const response = await callOpenAI(prompt);
    return response.split('\n').filter(line => line.trim()).slice(0, 15);
  } catch (error) {
    console.error('Error extracting competencies:', error);
    return ['JavaScript', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management'];
  }
}

async function analyzeCompanySignals(jobDescription: string): Promise<{ culture: string[]; values: string[]; priorities: string[] }> {
  const prompt = `Analyze this job description to extract company culture, values, and business priorities.

Job Description:
${jobDescription}

Identify:
1. Company culture signals (collaborative, innovative, fast-paced, etc.)
2. Core values (customer-focused, integrity, excellence, etc.) 
3. Business priorities (growth, efficiency, quality, etc.)

Return as simple lists, one item per line for each category.`;

  try {
    const response = await callOpenAI(prompt);
    const lines = response.split('\n').filter(line => line.trim());
    return {
      culture: lines.slice(0, 3),
      values: lines.slice(3, 6),
      priorities: lines.slice(6, 9)
    };
  } catch (error) {
    console.error('Error analyzing company signals:', error);
    return { 
      culture: ['collaborative', 'innovative'], 
      values: ['excellence', 'integrity'], 
      priorities: ['growth', 'quality'] 
    };
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

  const prompt = `You are an expert ATS resume writer. Rewrite this resume to optimize for both ATS systems and human reviewers.

INSTRUCTIONS:
- ${voiceInstructions}
- ${modeInstructions}
- Include these key competencies naturally: ${competencies.join(', ')}
- Align with company culture: ${signals.culture.join(', ')}
- Reflect company values: ${signals.values.join(', ')}
- Address business priorities: ${signals.priorities.join(', ')}

ORIGINAL RESUME:
${params.resumeContent || params.manualEntry}

TARGET JOB DESCRIPTION:
${params.jobDescription}

REQUIREMENTS:
1. Include ALL relevant competencies naturally in the text
2. Quantify achievements with specific metrics where possible
3. Use strong action verbs and industry keywords
4. Ensure ATS compatibility with clean formatting
5. Make every word count toward landing an interview

${params.includeTable ? "Include a skills table at the end with technical competencies organized by category." : ""}

Rewrite the resume now:`;

  return await callOpenAI(prompt);
}

async function rapidReviewLoop(resume: string, jobDescription: string): Promise<number> {
  const prompt = `Rate this resume on a scale of 1-5 (5 = excellent) based on how well it matches the job requirements.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Evaluate based on:
- Keyword alignment with job requirements
- Quantified achievements and impact
- ATS compatibility and formatting
- Overall readability and professional presentation

Return only a number from 1 to 5.`;

  try {
    const response = await callOpenAI(prompt);
    const score = parseInt(response.trim());
    return isNaN(score) ? 3 : Math.max(1, Math.min(5, score));
  } catch (error) {
    console.error('Error in review loop:', error);
    return 3;
  }
}

async function generateFinalResume(optimizedResume: string, params: ResumeParams, reviewScore: number): Promise<string> {
  if (reviewScore >= 4) {
    return formatOutput(optimizedResume, params.format);
  }
  
  // Low score - run one more optimization pass
  const prompt = `This resume scored ${reviewScore}/5 and needs improvement. Apply final polish focusing on:

RESUME TO IMPROVE:
${optimizedResume}

IMPROVEMENTS NEEDED:
1. Stronger action verbs and power words
2. More specific quantifiable metrics and achievements
3. Better keyword integration for ATS optimization
4. Improved readability and professional flow

Maximum word count: ${params.mode === 'concise' ? 350 : params.mode === 'detailed' ? 550 : 450}

Provide the improved resume:`;

  try {
    const polishedResume = await callOpenAI(prompt);
    return formatOutput(polishedResume, params.format);
  } catch (error) {
    console.error('Error in final polish:', error);
    return formatOutput(optimizedResume, params.format);
  }
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
  try {
    // Generate cover letter
    const coverLetterPrompt = `Write a compelling cover letter under 250 words based on this resume and job description.

RESUME:
${finalResume}

JOB DESCRIPTION:
${params.jobDescription}

REQUIREMENTS:
1. Open with specific connection to the role
2. Highlight 2-3 key achievements from resume
3. Show understanding of company needs
4. Close with confident next steps
5. Maximum 250 words, professional and engaging tone

Write the cover letter:`;

    const coverLetter = await callOpenAI(coverLetterPrompt);

    // Generate recruiter highlights
    const highlightsPrompt = `Create 5 compelling bullet points that a recruiter can quickly scan based on this resume.

RESUME:
${finalResume}

Create 5 bullet points with:
1. Quantifiable achievements
2. Relevant experience highlights  
3. Key skills alignment
4. Notable accomplishments
5. Clear value proposition

Each bullet should be under 15 words and include metrics where possible.
Return as a numbered list:`;

    const highlightsResponse = await callOpenAI(highlightsPrompt);
    const recruiterHighlights = highlightsResponse
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, ''))
      .slice(0, 5);

    // Generate interview toolkit
    const toolkitPrompt = `Create interview preparation materials based on this resume and job description.

RESUME:
${finalResume}

JOB DESCRIPTION:
${params.jobDescription}

Provide:
1. 5 likely interview questions based on job requirements
2. A professional follow-up email template (under 150 words)
3. 3 potential skill gaps to address

Format as:
QUESTIONS:
[list questions]

FOLLOW-UP EMAIL:
[email template]

SKILL GAPS:
[list gaps]`;

    const toolkitResponse = await callOpenAI(toolkitPrompt);
    
    // Parse toolkit response
    const sections = toolkitResponse.split(/(?:QUESTIONS:|FOLLOW-UP EMAIL:|SKILL GAPS:)/);
    const questions = sections[1]?.split('\n').filter(line => line.trim()).slice(0, 5) || [
      "Tell me about yourself and your background",
      "Why are you interested in this role?",
      "What are your greatest strengths?"
    ];
    const followUpEmail = sections[2]?.trim() || "Thank you for taking the time to interview me today. I'm very excited about the opportunity to contribute to your team.";
    const skillGaps = sections[3]?.split('\n').filter(line => line.trim()).slice(0, 3) || [
      "Industry-specific knowledge",
      "Advanced technical skills",
      "Leadership experience"
    ];

    // Generate KPI tracker
    const kpiPrompt = `Create a weekly job search KPI tracking template for someone pursuing this type of role.

JOB TYPE: Based on the job description provided
TARGET ROLE: ${params.jobDescription.split('\n')[0] || 'Target Role'}

Create a weekly checklist with metrics for:
1. Application activities
2. Networking efforts
3. Skill development
4. Interview preparation
5. Follow-up actions

Format as a simple checklist:`;

    const weeklyKPITracker = await callOpenAI(kpiPrompt);

    return {
      coverLetter,
      recruiterHighlights,
      interviewToolkit: {
        questions,
        followUpEmail,
        skillGaps
      },
      weeklyKPITracker
    };
  } catch (error) {
    console.error('Error creating deliverables:', error);
    // Return fallback content
    return {
      coverLetter: "I am writing to express my strong interest in this position. Based on my experience and skills outlined in my resume, I believe I would be a valuable addition to your team.",
      recruiterHighlights: [
        "Experienced professional with relevant background",
        "Strong track record of delivering results",
        "Excellent communication and collaboration skills",
        "Proven ability to adapt and learn quickly",
        "Committed to continuous improvement and growth"
      ],
      interviewToolkit: {
        questions: [
          "Tell me about yourself and your background",
          "Why are you interested in this role?",
          "What are your greatest strengths?",
          "Describe a challenging project you've worked on",
          "Where do you see yourself in 5 years?"
        ],
        followUpEmail: "Thank you for taking the time to interview me today. I'm very excited about the opportunity to contribute to your team and look forward to hearing about next steps.",
        skillGaps: [
          "Industry-specific knowledge",
          "Advanced technical skills", 
          "Leadership experience"
        ]
      },
      weeklyKPITracker: `WEEKLY JOB SEARCH KPI TRACKER

📬 Applications Sent: ___ / 5
🤝 Networking Touches: ___ / 3  
🏆 Interview Invites: ___
📞 Phone Screens: ___
🎯 Final Interviews: ___
💼 Offers Received: ___

Weekly Goals:
• Send 5 targeted applications
• Make 3 meaningful networking connections  
• Schedule 1+ interview
• Follow up on pending applications
• Update LinkedIn with recent achievements`
    };
  }
}

async function checkGrammarAndReadability(text: string): Promise<number> {
  try {
    const prompt = `Analyze the readability and grammar of this text. Provide a score from 0-100 based on:
- Grammar correctness
- Sentence structure and flow
- Professional language use
- Clarity and conciseness

TEXT TO ANALYZE:
${text}

Return only a number from 0 to 100.`;

    const response = await callOpenAI(prompt);
    const score = parseInt(response.trim());
    return isNaN(score) ? 75 : Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error checking grammar:', error);
    return 75; // Default good score
  }
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

async function callOpenAI(prompt: string): Promise<string> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI API...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ 
        role: 'user', 
        content: prompt 
      }],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return data.choices[0].message.content.trim();
}