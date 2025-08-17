import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/stores/appData";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const SaveToolkitButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");

  const { user } = useAuth();
  const { settings, inputs, outputs } = useAppDataStore();
  const { saveToolkit } = useDashboardStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const canSave = () => {
    return user && outputs?.resume && outputs?.coverLetter && outputs?.highlights && outputs?.toolkit;
  };

  const handleSave = async () => {
    if (!canSave() || !title.trim() || !jobTitle.trim() || !company.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await saveToolkit({
        title: title.trim(),
        job_title: jobTitle.trim(),
        company: company.trim(),
        settings,
        inputs,
        outputs: outputs!,
      });

      toast({
        title: "Toolkit Saved!",
        description: "Your job toolkit has been saved to the dashboard.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            View Dashboard
          </Button>
        ),
      });

      setIsOpen(false);
      setTitle("");
      setJobTitle("");
      setCompany("");
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save toolkit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Button asChild variant="outline">
        <a href="/auth">Sign In to Save</a>
      </Button>
    );
  }

  if (!canSave()) {
    return (
      <Button disabled variant="outline">
        Complete All Steps to Save
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent text-white px-6 hover:scale-105 transition-transform">
          <Save className="mr-2 h-4 w-4" />
          Save Job Toolkit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Save Complete Toolkit
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Toolkit Title</Label>
            <Input
              id="title"
              placeholder="e.g., Senior PM at Acme Corp"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              placeholder="e.g., Senior Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="e.g., Acme Corp"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !jobTitle.trim() || !company.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save Toolkit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};