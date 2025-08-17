import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SectionCard } from './SectionCard';

interface ToolkitData {
  introScript?: string;
  carlQuestions?: string[];
  soarQuestions?: string[];
  interviewerQuestions?: string[];
  followUpEmail?: string;
  skillGaps?: string[];
  learningResources?: string[];
  linkedinOutreach?: string;
  kpiDashboard?: string;
}

interface ToolkitAccordionProps {
  data: ToolkitData;
}

export function ToolkitAccordion({ data }: ToolkitAccordionProps) {
  const defaultKpiDashboard = `📬 Applications Sent: ___ / 5
🤝 Networking Touches: ___ / 3  
🏆 Interview Invites: ___  (goal: 1+ / week)
📞 Phone Screens: ___
🎯 Final Interviews: ___
💼 Offers Received: ___

Weekly Goals:
• Send 5 targeted applications
• Make 3 meaningful networking connections  
• Schedule 1+ interview
• Follow up on pending applications
• Update LinkedIn with recent achievements`;

  const defaultLearningResources = [
    "Search for courses related to your skill gaps",
    "Look for industry-specific tutorials",
    "Find certification programs",
    "Explore online bootcamps",
    "Watch expert interviews and talks"
  ];

  return (
    <Accordion type="multiple" className="space-y-4">
      {/* Intro Script */}
      <AccordionItem value="intro" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Tell Me About Yourself Script</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Elevator Pitch"
            content={data.introScript || "Present → Past → Future framework script will appear here after generation"}
            badge="Present → Past → Future"
          />
        </AccordionContent>
      </AccordionItem>

      {/* CARL Questions */}
      <AccordionItem value="carl" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">CARL Behavioral Questions</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Context-Action-Result-Learning"
            content={data.carlQuestions || []}
            type="list"
            badge="5 Questions"
          />
        </AccordionContent>
      </AccordionItem>

      {/* SOAR Questions */}
      <AccordionItem value="soar" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">SOAR Situational Questions</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Situation-Obstacle-Action-Result"
            content={data.soarQuestions || []}
            type="list"
            badge="5 Questions"
          />
        </AccordionContent>
      </AccordionItem>

      {/* Interviewer Questions */}
      <AccordionItem value="interviewer" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Questions for Interviewer</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Thoughtful Questions to Ask"
            content={data.interviewerQuestions || []}
            type="list"
            badge="3 Questions"
          />
        </AccordionContent>
      </AccordionItem>

      {/* Follow-up Email */}
      <AccordionItem value="followup" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Follow-up Email Template</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Post-Interview Follow-up"
            content={data.followUpEmail || "Professional follow-up email template will appear here"}
            type="email"
            wordLimit={200}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Skill Gaps */}
      <AccordionItem value="skills" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Skill-Drift Alert</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Skills Missing from Your Resume"
            content={data.skillGaps || []}
            type="list"
            badge="Gaps Identified"
          />
        </AccordionContent>
      </AccordionItem>

      {/* Learning Resources */}
      <AccordionItem value="learning" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Learning List</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Recommended Learning Resources"
            content={data.learningResources || defaultLearningResources}
            type="links"
            badge="5 Resources"
          />
        </AccordionContent>
      </AccordionItem>

      {/* LinkedIn Outreach */}
      <AccordionItem value="linkedin" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">LinkedIn Outreach</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Networking Message Template"
            content={data.linkedinOutreach || "Personalized LinkedIn connection request will appear here"}
          />
        </AccordionContent>
      </AccordionItem>

      {/* KPI Dashboard */}
      <AccordionItem value="kpi" className="border border-border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Weekly KPI Tracker</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <SectionCard
            title="Job Search Metrics"
            content={data.kpiDashboard || defaultKpiDashboard}
            type="kpi"
            badge="Weekly Goals"
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}