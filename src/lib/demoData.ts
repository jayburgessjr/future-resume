/**
 * Demo data and utilities for QA testing
 */

export const DEMO_DATA = {
  resume: `John Smith
Senior Software Engineer
Email: john.smith@email.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2020 - Present
• Led development of microservices architecture serving 1M+ users
• Reduced system latency by 40% through performance optimizations
• Mentored team of 5 junior developers and established coding standards
• Implemented CI/CD pipelines improving deployment frequency by 300%

Software Engineer | StartupXYZ | 2018 - 2020
• Built full-stack web applications using React, Node.js, and PostgreSQL
• Collaborated with product team to define technical requirements
• Developed RESTful APIs handling 100K+ daily requests
• Participated in agile development process and code reviews

TECHNICAL SKILLS
• Languages: JavaScript, TypeScript, Python, Java
• Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
• Backend: Node.js, Express, FastAPI, Spring Boot
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes, Terraform
• Tools: Git, Jenkins, Jira, Figma

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014 - 2018`,

  jobDescription: `Senior Full Stack Developer
Company: InnovativeTech Solutions
Location: San Francisco, CA (Remote)

We are seeking a Senior Full Stack Developer to join our growing engineering team. You will be responsible for designing and implementing scalable web applications that serve our global customer base.

Key Responsibilities:
• Design and develop full-stack web applications using modern technologies
• Collaborate with cross-functional teams including product, design, and DevOps
• Write clean, maintainable, and well-tested code
• Optimize application performance and scalability
• Mentor junior developers and participate in code reviews
• Stay current with emerging technologies and industry best practices

Required Qualifications:
• 5+ years of experience in full-stack development
• Strong proficiency in JavaScript/TypeScript and modern frameworks (React, Vue.js, or Angular)
• Experience with backend technologies (Node.js, Python, or Java)
• Knowledge of database design and optimization (SQL and NoSQL)
• Experience with cloud platforms (AWS, GCP, or Azure)
• Understanding of DevOps practices and CI/CD pipelines
• Excellent problem-solving and communication skills
• Bachelor's degree in Computer Science or related field

Preferred Qualifications:
• Experience with microservices architecture
• Knowledge of containerization (Docker, Kubernetes)
• Experience with agile development methodologies
• Previous experience in a startup environment
• Open source contributions

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements and unlimited PTO
• Professional development budget
• State-of-the-art equipment and workspace`,

  companySignal: `InnovativeTech Solutions recently announced a $50M Series B funding round led by Accel Partners. The company is expanding rapidly and has grown from 50 to 200 employees in the past year. They're focusing heavily on AI-powered features and have mentioned plans to double their engineering team by end of 2024.`,

  settings: {
    mode: 'detailed' as const,
    voice: 'first-person' as const,
    format: 'plain_text' as const,
    includeTable: false,
    proofread: true,
  }
};

/**
 * Load demo data into the application store
 */
export function loadDemoData() {
  if (typeof window !== 'undefined') {
    const { useAppDataStore } = require('@/stores/appData');
    
    // Update inputs with demo data
    useAppDataStore.getState().updateInputs({
      resumeText: DEMO_DATA.resume,
      jobText: DEMO_DATA.jobDescription,
      companySignal: DEMO_DATA.companySignal,
      companyName: 'InnovativeTech Solutions',
      companyUrl: 'https://innovativetech.com'
    });
    
    // Update settings
    useAppDataStore.getState().updateSettings(DEMO_DATA.settings);
    
    console.log('🎯 Demo data loaded successfully');
  }
}

/**
 * Reset all application data to initial state
 */
export function resetAllData() {
  if (typeof window !== 'undefined') {
    const { useAppDataStore } = require('@/stores/appData');
    const { usePersistenceStore } = require('@/stores/persistenceStore');
    const { useSubscriptionStore } = require('@/stores/subscriptionStore');
    
    // Clear app data
    useAppDataStore.getState().clearData();
    
    // Clear persistence data
    usePersistenceStore.getState().clearAll?.();
    
    // Clear subscription state (except actual subscription status)
    const subscriptionStore = useSubscriptionStore.getState();
    if (subscriptionStore.error) {
      subscriptionStore.error = null;
    }
    
    // Clear localStorage
    const keysToRemove = [
      'app-data-storage',
      'auth-storage',
      'persistence-storage',
      'resume-generation-inputs'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🧹 All application data reset');
  }
}

/**
 * Export current application state for debugging
 */
export function exportAppState() {
  if (typeof window !== 'undefined') {
    const { useAppDataStore } = require('@/stores/appData');
    const { usePersistenceStore } = require('@/stores/persistenceStore');
    
    const state = {
      appData: useAppDataStore.getState(),
      persistence: usePersistenceStore.getState(),
      timestamp: new Date().toISOString(),
    };
    
    console.log('📊 Current Application State:', state);
    return state;
  }
}

/**
 * QA utilities for testing various scenarios
 */
export const QA_UTILITIES = {
  loadDemoData,
  resetAllData,
  exportAppState,
  
  // Quick test scenarios
  loadLongResume: () => {
    const longContent = DEMO_DATA.resume + '\n\n' + 
      'ADDITIONAL EXPERIENCE\n\n' +
      'Junior Developer | CompanyABC | 2016 - 2018\n' +
      '• Built internal tools and automation scripts\n' +
      '• Participated in daily standups and sprint planning\n' +
      '• Learned modern development practices and frameworks\n\n' +
      'CERTIFICATIONS\n' +
      '• AWS Certified Solutions Architect\n' +
      '• Google Cloud Professional Developer\n' +
      '• Certified Kubernetes Administrator\n\n' +
      'PROJECTS\n' +
      '• Open source contributor to React ecosystem\n' +
      '• Built personal portfolio website with 10K+ monthly visitors\n' +
      '• Created development blog with technical tutorials';
    
    loadDemoData();
    const { useAppDataStore } = require('@/stores/appData');
    useAppDataStore.getState().updateInputs({ resumeText: longContent });
  },
  
  loadMinimalData: () => {
    const { useAppDataStore } = require('@/stores/appData');
    useAppDataStore.getState().updateInputs({
      resumeText: 'Software Engineer with 3 years experience in web development.',
      jobText: 'Looking for a Full Stack Developer with JavaScript experience.',
    });
  },
  
  triggerErrorState: () => {
    const { useAppDataStore } = require('@/stores/appData');
    useAppDataStore.getState().updateInputs({
      resumeText: '',
      jobText: '',
    });
  }
};