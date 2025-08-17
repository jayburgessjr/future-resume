# **The Best Darn Job Resume Builder - PRD/Knowledge Base**

## **Purpose & Vision**
AI-powered resume optimization platform that transforms job applications through intelligent content rewriting, ATS optimization, and comprehensive career toolkit generation. Leverages a 7-phase AI process to create job-matched resumes with supporting materials.

## **User Personas**
- **Primary**: Job seekers (entry-level to executive) seeking ATS-optimized resumes
- **Secondary**: Career changers needing tailored positioning
- **Tertiary**: Professionals requiring multiple industry-specific versions

## **App Flow Architecture**
```
Landing Page (/) → 
  Auth (/auth) → 
    Resume Builder (/builder) → 
      AI Generation → 
        Cover Letter (/cover-letter) → 
          Recruiter Highlights (/recruiter-highlights) → 
            Interview Toolkit (/interview-toolkit) → 
              Export/Download
```

## **Core Features: 9-Phase System**

### **Phase 1-3: Content Analysis**
- **Core Competency Extraction**: Job description parsing
- **Company Signal Analysis**: Culture/values identification  
- **Resume Rewriting**: Keyword injection & optimization

### **Phase 4-6: Quality & Output**
- **Rapid Review Loop**: 1-5 scoring system
- **Final Output Generation**: Format preferences (markdown/plain/JSON)
- **Deliverables Creation**: Cover letter, highlights, toolkit

### **Phase 7-9: Enhancement**
- **Grammar & Readability**: Flesch scoring
- **Version History**: Track iterations (Pro only)
- **Multi-format Export**: PDF/Word/JSON (Pro only)

## **Tech Stack**
- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui, Radix UI
- **State Management**: Zustand (appData, subscriptionStore, authStore)
- **Backend**: Supabase (auth, database, edge functions)
- **AI Processing**: OpenAI API via Edge Functions
- **Payments**: Stripe (checkout, customer portal)
- **Testing**: Vitest, Testing Library
- **Build**: Bun (package manager)

## **Design Tokens**
```css
/* Brand Colors */
--brand-navy: #001f3f;
--brand-orange: #FF851B;

/* Typography Scale */
text-xs: 12px, text-sm: 14px, text-base: 16px, 
text-lg: 18px, text-xl: 20px, text-2xl: 24px,
text-3xl: 28px, text-4xl: 32px

/* Component Variants */
- Button: primary(navy), accent(orange), secondary, destructive
- Card: elegant, interactive, hover transforms
- Input: focus rings, WCAG contrast compliance
```

## **File/Route Map**
```
src/
├── pages/
│   ├── LandingPage.tsx (/)
│   ├── AuthPage.tsx (/auth)
│   ├── ResumeBuilderPage.tsx (/builder)
│   ├── CoverLetterPage.tsx (/cover-letter)
│   ├── RecruiterHighlightsPage.tsx (/recruiter-highlights)
│   └── InterviewToolkitPage.tsx (/interview-toolkit)
├── stores/
│   ├── appData.ts (resume content, company signals)
│   ├── subscriptionStore.ts (Stripe integration)
│   └── persistenceStore.ts (data sync)
├── components/
│   ├── subscription/ (FeatureGuard, UpgradeModal, SubscriptionBadge)
│   ├── company/ (CompanySignalPanel)
│   └── ui/ (shadcn components)
└── lib/
    ├── resumeService.ts (7-phase AI flow)
    ├── qualityCheck.ts (Greatness Check)
    └── export.ts (multi-format output)

supabase/functions/
├── generate-resume/ (OpenAI integration)
├── create-checkout/ (Stripe checkout)
├── check-subscription/ (subscription status)
└── customer-portal/ (billing management)
```

## **Data Model**
```sql
profiles: id(uuid), user_id(uuid), email(text), 
         stripe_customer_id(text), subscribed(bool),
         subscription_tier(text), subscription_end(timestamp)

resumes: id(uuid), profile_id(uuid→profiles.id), 
         title(text), created_at(timestamp), updated_at(timestamp)

resume_versions: id(uuid), resume_id(uuid→resumes.id),
                inputs(jsonb), outputs(jsonb), settings(jsonb),
                created_at(timestamp)
```

## **Subscription Tiers**
- **Free**: 1 resume, basic generation, no exports
- **Pro ($20/month)**: Unlimited resumes, version history, Interview Toolkit, PDF/Word exports, customer portal

## **Non-Goals**
- ❌ Web scraping or automated job board integration  
- ❌ Real-time collaboration features
- ❌ Template marketplace or visual resume builders
- ❌ Social networking or job matching
- ❌ Mobile app development (web-responsive only)

## **Future Roadmap**
- **Q1**: LinkedIn profile optimization
- **Q2**: Salary negotiation toolkit  
- **Q3**: Industry-specific templates
- **Q4**: Team/enterprise features

---

## **Development Do/Don't Checklist**

### **✅ DO:**
- **Scope-lock features**: Keep focused on resume optimization core
- **Mobile-first responsive**: All components must work on mobile
- **Feature-gate premium**: Use `<FeatureGuard>` for Pro features
- **Validate inputs**: Word count limits, required fields
- **Test accessibility**: ARIA labels, keyboard navigation, focus traps
- **Log quality checks**: Use `performGreatnessCheck()` in development
- **Persist state**: Save drafts automatically via `persistenceStore`
- **Handle errors gracefully**: Show upgrade modals, not crashes

### **❌ DON'T:**
- **No web fetches**: No scraping, no external API calls from frontend
- **No hardcoded secrets**: Use Supabase Edge Function Secrets only  
- **No feature creep**: Resist adding non-resume features
- **No direct SQL**: Use Supabase client methods only
- **No subscription bypasses**: Respect tier limitations strictly
- **No layout shifts**: Ensure stable loading states
- **No accessibility shortcuts**: Maintain WCAG compliance
- **No unvalidated generation**: Always check params before AI calls

---

*Last Updated: 2024-08-17 | Version: 1.0 | Status: Production Ready*