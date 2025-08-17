/**
 * Quality assessment utilities for resume generation
 */

interface GreatnessCheckResult {
  score: number; // 0-100
  rationale: string;
  factors: {
    keywordAlignment: number;
    readability: number;
    structure: number;
    completeness: number;
  };
}

/**
 * Perform comprehensive quality check on generated resume content
 */
export function performGreatnessCheck(
  resumeContent: string,
  jobDescription: string,
  settings: any
): GreatnessCheckResult {
  const factors = {
    keywordAlignment: assessKeywordAlignment(resumeContent, jobDescription),
    readability: assessReadability(resumeContent),
    structure: assessStructure(resumeContent),
    completeness: assessCompleteness(resumeContent, settings),
  };

  const score = Math.round(
    (factors.keywordAlignment * 0.3 +
     factors.readability * 0.25 +
     factors.structure * 0.25 +
     factors.completeness * 0.2) * 100
  ) / 100;

  const rationale = generateRationale(score, factors);

  return {
    score,
    rationale,
    factors,
  };
}

function assessKeywordAlignment(resume: string, jobDescription: string): number {
  if (!jobDescription) return 0.5;

  const jobKeywords = extractKeywords(jobDescription.toLowerCase());
  const resumeContent = resume.toLowerCase();
  
  const matchCount = jobKeywords.filter(keyword => 
    resumeContent.includes(keyword)
  ).length;

  return Math.min(matchCount / Math.max(jobKeywords.length, 1), 1);
}

function assessReadability(content: string): number {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);
  
  // Optimal range: 12-18 words per sentence
  if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 18) {
    return 1;
  } else if (avgWordsPerSentence < 8 || avgWordsPerSentence > 25) {
    return 0.3;
  } else {
    return 0.7;
  }
}

function assessStructure(content: string): number {
  let score = 0;
  
  // Check for sections (headers)
  if (content.match(/^(#|##|\*\*[A-Z])/m)) score += 0.3;
  
  // Check for bullet points
  if (content.match(/^\s*[-•*]/m)) score += 0.3;
  
  // Check for consistent formatting
  const bulletCount = (content.match(/^\s*[-•*]/gm) || []).length;
  if (bulletCount >= 3) score += 0.2;
  
  // Check for contact information
  if (content.match(/\b[\w.-]+@[\w.-]+\.\w+\b/)) score += 0.2;
  
  return Math.min(score, 1);
}

function assessCompleteness(content: string, settings: any): number {
  let score = 0;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  
  // Appropriate length based on mode
  const targetLength = settings.mode === 'concise' ? 200 : 
                      settings.mode === 'detailed' ? 400 : 300;
  
  const lengthScore = Math.min(wordCount / targetLength, 1);
  score += lengthScore * 0.5;
  
  // Essential sections present
  const essentialSections = ['experience', 'skills', 'education'];
  const sectionMatches = essentialSections.filter(section =>
    content.toLowerCase().includes(section)
  ).length;
  
  score += (sectionMatches / essentialSections.length) * 0.5;
  
  return Math.min(score, 1);
}

function extractKeywords(text: string): string[] {
  // Common industry keywords and skills
  const commonKeywords = [
    'javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker',
    'agile', 'scrum', 'management', 'leadership', 'analysis', 'strategy',
    'communication', 'collaboration', 'problem-solving', 'innovation'
  ];
  
  return text.split(/\s+/)
    .map(word => word.replace(/[^\w]/g, ''))
    .filter(word => word.length > 3)
    .concat(commonKeywords.filter(keyword => text.includes(keyword)))
    .slice(0, 20); // Limit to top 20 keywords
}

function generateRationale(score: number, factors: any): string {
  if (score >= 0.9) {
    return "Excellent resume with strong keyword alignment, clear structure, and optimal readability";
  } else if (score >= 0.8) {
    return "High-quality resume with good job alignment and professional formatting";
  } else if (score >= 0.7) {
    return "Solid resume that effectively communicates qualifications with room for minor improvements";
  } else if (score >= 0.6) {
    return "Good foundation but could benefit from better keyword optimization or structural improvements";
  } else if (score >= 0.5) {
    return "Adequate resume that may need enhanced job alignment and clearer formatting";
  } else {
    return "Resume needs significant improvement in structure, content alignment, or completeness";
  }
}

/**
 * Log quality assessment results for development
 */
export function logQualityAssessment(result: GreatnessCheckResult, context: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🎯 Resume Quality Assessment - ${context}`);
    console.log(`Overall Score: ${(result.score * 100).toFixed(1)}%`);
    console.log(`Rationale: ${result.rationale}`);
    console.log('Factor Breakdown:');
    console.log(`  • Keyword Alignment: ${(result.factors.keywordAlignment * 100).toFixed(1)}%`);
    console.log(`  • Readability: ${(result.factors.readability * 100).toFixed(1)}%`);
    console.log(`  • Structure: ${(result.factors.structure * 100).toFixed(1)}%`);
    console.log(`  • Completeness: ${(result.factors.completeness * 100).toFixed(1)}%`);
    console.groupEnd();
  }
}