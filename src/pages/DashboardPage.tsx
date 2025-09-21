"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/stores";
import { ProfileSummaryCard } from "@/components/dashboard/ProfileSummaryCard";
import { ModuleFilters } from "@/components/dashboard/ModuleFilters";
import { ResumeModule } from "@/components/dashboard/modules/ResumeModule";
import { CoverLetterModule } from "@/components/dashboard/modules/CoverLetterModule";
import { InterviewModule } from "@/components/dashboard/modules/InterviewModule";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, FileText, PenLine, MessageCircle, LogOut } from "lucide-react";

const MODULES: Array<{
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "resume",
    label: "Résumé Builder",
    description: "Transform your base résumé into an ATS-ready version tailored to the role.",
    icon: FileText,
  },
  {
    id: "cover",
    label: "Cover Letter",
    description: "Spin up concise outreach copy that reuses your strongest stories.",
    icon: PenLine,
  },
  {
    id: "interview",
    label: "Interview Lab",
    description: "Pull recruiter highlights, interview prompts, and follow-up actions in one go.",
    icon: MessageCircle,
  },
];

type ModuleId = "resume" | "cover" | "interview";

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { displayName, jobTitle, northStar } = useProfileStore();
  const [activeModule, setActiveModule] = useState<ModuleId>("resume");

  const fallbackName = useMemo(() => {
    if (displayName) return displayName;
    const fromEmail = user?.email ? user.email.split("@")[0] : "";
    return fromEmail || "Welcome";
  }, [displayName, user?.email]);

  const activeModuleCopy = MODULES.find((module) => module.id === activeModule);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-72 flex-col border-r border-border/40 bg-muted/30 xl:w-80 lg:flex">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Future Resume</p>
                  <p className="text-lg font-semibold">Career Command</p>
                </div>
              </div>
              <div className="rounded-lg border border-border/40 bg-background/80 p-4">
                <p className="text-sm font-medium text-foreground">{fallbackName}</p>
                {jobTitle && (
                  <p className="text-xs text-muted-foreground">Targeting {jobTitle}</p>
                )}
                {northStar && (
                  <p className="mt-2 line-clamp-4 text-xs italic text-muted-foreground/90">
                    “{northStar}”
                  </p>
                )}
              </div>
            </div>

            <nav className="space-y-1">
              {MODULES.map((module) => {
                const isActive = module.id === activeModule;
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full rounded-lg border border-transparent p-4 text-left transition-colors hover:border-border/50 hover:bg-background/60 ${
                      isActive ? "border-border/70 bg-background" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                          isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{module.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="border-t border-border/40 p-6">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Welcome back</p>
              <h1 className="text-2xl font-semibold text-foreground">{fallbackName}</h1>
              {jobTitle && (
                <p className="text-sm text-muted-foreground">Crafting materials for {jobTitle}</p>
              )}
              {activeModuleCopy && (
                <Badge variant="outline" className="mt-2 w-fit text-xs uppercase tracking-wide">
                  {activeModuleCopy.label}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="lg:hidden" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="border-t border-border/40 bg-background/90 py-3 lg:hidden">
            <div className="mx-auto max-w-6xl px-4">
              <Tabs value={activeModule} onValueChange={(value) => setActiveModule(value as ModuleId)}>
                <TabsList className="grid w-full grid-cols-3">
                  {MODULES.map((module) => (
                    <TabsTrigger key={module.id} value={module.id} className="text-xs">
                      {module.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
            <ProfileSummaryCard />
            <ModuleFilters />

            {activeModule === "resume" && <ResumeModule />}
            {activeModule === "cover" && <CoverLetterModule />}
            {activeModule === "interview" && <InterviewModule />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
