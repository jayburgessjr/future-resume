import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SubscriptionBadge } from "@/components/subscription/SubscriptionBadge";
import { MasterResumeCard } from "@/components/dashboard/MasterResumeCard";
import { JobList } from "@/components/dashboard/JobList";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ExportBar } from "@/components/dashboard/ExportBar";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { 
  useDashboardStore, 
  type Job, 
  type Resume 
} from "@/stores/dashboardStore";
import { useAppDataStore } from "@/stores/appData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    jobs, 
    resumes, 
    masterResume, 
    loading, 
    error,
    loadData,
    createJob,
    updateJob,
    deleteJob,
    archiveJob,
    createMasterResume,
    setAsMaster,
    deleteResume,
    getJobById,
    getSkillGaps
  } = useDashboardStore();

  const { updateInputs } = useAppDataStore();

  // UI State
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Form state
  const [currentJob, setCurrentJob] = useState<Partial<Job>>({
    title: "",
    company: "",
    description: "",
    tags: [],
    company_signal: ""
  });
  const [resumeTitle, setResumeTitle] = useState("");
  const [viewContent, setViewContent] = useState({ title: "", content: "" });
  const [compareData, setCompareData] = useState<{
    job: Job;
    gaps: { missing: string[]; present: string[] };
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const resetJobForm = () => {
    setCurrentJob({
      title: "",
      company: "",
      description: "",
      tags: [],
      company_signal: ""
    });
  };

  const handleCreateJob = async () => {
    try {
      if (!currentJob.title || !currentJob.company || !currentJob.description) {
        toast({
          title: "Missing fields",
          description: "Please fill in title, company, and description.",
          variant: "destructive",
        });
        return;
      }

      await createJob({
        ...currentJob,
        tags: currentJob.tags || [],
        archived: false
      } as Omit<Job, 'id' | 'created_at' | 'updated_at'>);

      setShowJobDialog(false);
      resetJobForm();
      toast({
        title: "Job saved",
        description: "Job description saved successfully.",
      });
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to save job description.",
        variant: "destructive",
      });
    }
  };

  const handleCreateMasterResume = async () => {
    try {
      if (!resumeTitle.trim()) {
        toast({
          title: "Missing title",
          description: "Please enter a title for your master résumé.",
          variant: "destructive",
        });
        return;
      }

      await createMasterResume(resumeTitle);
      setShowResumeDialog(false);
      setResumeTitle("");
      toast({
        title: "Master résumé created",
        description: "Your master résumé has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating master resume:", error);
      toast({
        title: "Error",
        description: "Failed to create master résumé.",
        variant: "destructive",
      });
    }
  };

  const handleViewJob = (job: Job) => {
    setViewContent({
      title: `${job.title} at ${job.company}`,
      content: job.description
    });
    setShowViewDialog(true);
  };

  const handleViewResume = (resume: Resume) => {
    setViewContent({
      title: resume.title,
      content: "Resume content would be loaded here from resume versions..."
    });
    setShowViewDialog(true);
  };

  const handleCompareJob = (job: Job) => {
    if (!masterResume) {
      toast({
        title: "No master résumé",
        description: "Create a master résumé first to compare skills.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, using the job description as resume content
    // In a real app, this would load the actual resume content
    const gaps = getSkillGaps(job.description, "Sample resume content would be here");
    setCompareData({ job, gaps });
    setShowCompareDialog(true);
  };

  const handleSendToBuilder = (job: Job) => {
    // Update the app data store with the job information
    updateInputs({
      jobText: job.description,
      companySignal: job.company_signal,
      companyName: job.company
    });

    toast({
      title: "Sent to builder",
      description: `${job.title} details loaded into resume builder.`,
    });

    navigate('/builder');
  };

  const handleDeleteJob = (job: Job) => {
    setConfirmDialog({
      open: true,
      title: "Delete Job",
      description: `Are you sure you want to delete "${job.title}" at ${job.company}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteJob(job.id);
          toast({
            title: "Job deleted",
            description: "Job description has been deleted.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete job.",
            variant: "destructive",
          });
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      },
      variant: "destructive"
    });
  };

  const handleArchiveJob = async (job: Job) => {
    try {
      await archiveJob(job.id);
      toast({
        title: "Job archived",
        description: `${job.title} has been archived.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive job.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Home
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your résumés and job applications</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <SubscriptionBadge />
          </div>
        </header>

        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Master Resume Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Master Résumé</h2>
                </div>
                <MasterResumeCard
                  resume={masterResume}
                  onCreateNew={() => setShowResumeDialog(true)}
                  onView={handleViewResume}
                  onCreateVersion={() => {}}
                  onExport={(resume) => {
                    setViewContent({
                      title: resume.title,
                      content: "Resume content for export..."
                    });
                    setShowExportDialog(true);
                  }}
                />
              </section>

              {/* Job Descriptions Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-accent" />
                  <h2 className="text-xl font-semibold">Job Descriptions</h2>
                  <Badge variant="outline">{jobs.length}</Badge>
                </div>
                <JobList
                  jobs={jobs}
                  onCreateNew={() => setShowJobDialog(true)}
                  onView={handleViewJob}
                  onEdit={() => {}}
                  onCompare={handleCompareJob}
                  onSendToBuilder={handleSendToBuilder}
                  onArchive={handleArchiveJob}
                  onDelete={handleDeleteJob}
                />
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <QuickActions
                onCreateMasterResume={() => setShowResumeDialog(true)}
                onAddJobDescription={() => setShowJobDialog(true)}
                onRunComparison={() => {
                  if (jobs.length > 0) {
                    handleCompareJob(jobs[0]);
                  }
                }}
                onGenerateTargeted={() => navigate('/builder')}
                hasJobs={jobs.length > 0}
                hasMasterResume={!!masterResume}
              />
            </div>
          </div>
        )}

        {/* Dialogs */}
        
        {/* Add Job Dialog */}
        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Job Description</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={currentJob.title}
                    onChange={(e) => setCurrentJob(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={currentJob.company}
                    onChange={(e) => setCurrentJob(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., Microsoft"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={currentJob.description}
                  onChange={(e) => setCurrentJob(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Paste the complete job description here..."
                  rows={8}
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={currentJob.tags?.join(", ") || ""}
                  onChange={(e) => setCurrentJob(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
                  }))}
                  placeholder="e.g., remote, javascript, senior-level"
                />
              </div>
              
              <div>
                <Label htmlFor="signal">Company Signal (Optional)</Label>
                <Textarea
                  id="signal"
                  value={currentJob.company_signal}
                  onChange={(e) => setCurrentJob(prev => ({ ...prev, company_signal: e.target.value }))}
                  placeholder="Additional company context, culture, or specific requirements..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowJobDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob}>
                Save Job
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Master Resume Dialog */}
        <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Master Résumé</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="resume-title">Résumé Title</Label>
                <Input
                  id="resume-title"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="e.g., John Doe - Software Engineer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResumeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMasterResume}>
                Create Résumé
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Content Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{viewContent.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{viewContent.content}</pre>
            </div>
          </DialogContent>
        </Dialog>

        {/* Skills Comparison Dialog */}
        <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Skills Gap Analysis
              </DialogTitle>
            </DialogHeader>
            {compareData && (
              <div className="space-y-6 py-4">
                <div>
                  <h4 className="font-medium mb-2">Comparing against:</h4>
                  <p className="text-sm text-muted-foreground">
                    {compareData.job.title} at {compareData.job.company}
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Skills You Have ({compareData.gaps.present.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {compareData.gaps.present.map(skill => (
                          <Badge key={skill} className="bg-green-100 text-green-800 hover:bg-green-200">
                            {skill}
                          </Badge>
                        ))}
                        {compareData.gaps.present.length === 0 && (
                          <p className="text-sm text-muted-foreground">No matching skills found</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        Skills to Add ({compareData.gaps.missing.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {compareData.gaps.missing.map(skill => (
                          <Badge key={skill} variant="outline" className="border-orange-300 text-orange-700">
                            {skill}
                          </Badge>
                        ))}
                        {compareData.gaps.missing.length === 0 && (
                          <p className="text-sm text-muted-foreground">No missing skills detected</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCompareDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleSendToBuilder(compareData.job)}>
                    Optimize in Builder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                Export {viewContent.title}
                <Button variant="ghost" size="sm" onClick={() => setShowExportDialog(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ExportBar content={viewContent.content} filename={viewContent.title} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
          variant={confirmDialog.variant}
          confirmText={confirmDialog.variant === "destructive" ? "Delete" : "Confirm"}
        />
      </div>
    </div>
  );
};

export default DashboardPage;