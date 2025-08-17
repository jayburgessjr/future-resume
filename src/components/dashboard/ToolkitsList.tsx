import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolkitDrawer } from "./ToolkitDrawer";
import { ConfirmDialog } from "./ConfirmDialog";
import { useDashboardStore, type Toolkit } from "@/stores/dashboardStore";
import { useAppDataStore } from "@/stores/appData";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Heart,
  HeartIcon,
  Eye,
  Copy,
  Download,
  ExternalLink,
  Trash2,
  Package
} from "lucide-react";

interface ToolkitsListProps {
  toolkits: Toolkit[];
  onCreateNew: () => void;
}

export const ToolkitsList = ({ toolkits, onCreateNew }: ToolkitsListProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleFavorite, deleteToolkit } = useDashboardStore();
  const { updateInputs, updateSettings } = useAppDataStore();

  const [selectedToolkit, setSelectedToolkit] = useState<Toolkit | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const handleView = (toolkit: Toolkit) => {
    setSelectedToolkit(toolkit);
    setShowDrawer(true);
  };

  const handleToggleFavorite = async (toolkit: Toolkit) => {
    try {
      await toggleFavorite(toolkit.id);
      toast({
        title: toolkit.favorite ? "Removed from favorites" : "Added to favorites",
        description: `${toolkit.title} ${toolkit.favorite ? "removed from" : "added to"} favorites.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  const handleCopyAll = (toolkit: Toolkit) => {
    const outputs = toolkit.outputs || {};
    const content = [
      `## ${toolkit.title}`,
      `**Position:** ${toolkit.job_title}`,
      `**Company:** ${toolkit.company}`,
      "",
      "### Resume",
      outputs.resume || "No resume generated",
      "",
      "### Cover Letter", 
      outputs.coverLetter || "No cover letter generated",
      "",
      "### Recruiter Highlights",
      ...(outputs.highlights || []).map((h: string, i: number) => `${i + 1}. ${h}`),
      "",
      "### Interview Toolkit",
      outputs.interviewToolkit ? JSON.stringify(outputs.interviewToolkit, null, 2) : "No interview toolkit generated"
    ].join("\n");

    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Full toolkit content copied to clipboard.",
    });
  };

  const handleDownload = (toolkit: Toolkit) => {
    const outputs = toolkit.outputs || {};
    const content = [
      `## ${toolkit.title}`,
      `**Position:** ${toolkit.job_title}`,
      `**Company:** ${toolkit.company}`,
      "",
      "### Resume",
      outputs.resume || "No resume generated",
      "",
      "### Cover Letter", 
      outputs.coverLetter || "No cover letter generated",
      "",
      "### Recruiter Highlights",
      ...(outputs.highlights || []).map((h: string, i: number) => `${i + 1}. ${h}`),
      "",
      "### Interview Toolkit",
      outputs.interviewToolkit ? JSON.stringify(outputs.interviewToolkit, null, 2) : "No interview toolkit generated"
    ].join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolkit.company}-${toolkit.job_title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Toolkit downloaded as markdown file.",
    });
  };

  const handleSendToBuilder = (toolkit: Toolkit) => {
    toast({
      title: "Loading into builder",
      description: `${toolkit.title} is being loaded into the resume builder.`,
    });

    // Navigate to builder with toolkit ID - the BuilderFlowPage will handle loading
    navigate(`/builder?toolkit=${toolkit.id}`);
  };

  const handleDelete = (toolkit: Toolkit) => {
    setConfirmDialog({
      open: true,
      title: "Delete Toolkit",
      description: `Are you sure you want to delete "${toolkit.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteToolkit(toolkit.id);
          toast({
            title: "Toolkit deleted",
            description: "Toolkit has been deleted successfully.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete toolkit.",
            variant: "destructive",
          });
        }
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (toolkits.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Job Toolkits Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            Use the Resume Builder to create your first complete job application toolkit with targeted resume, cover letter, highlights, and interview prep.
          </p>
          <Button onClick={onCreateNew} className="bg-primary hover:bg-primary/90">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Resume Builder
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {toolkits.map((toolkit) => (
          <Card key={toolkit.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base leading-tight mb-1 truncate">
                    {toolkit.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">{toolkit.job_title}</span>
                    <span>•</span>
                    <span className="truncate">{toolkit.company}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFavorite(toolkit)}
                  className="shrink-0 text-muted-foreground hover:text-accent"
                >
                  {toolkit.favorite ? (
                    <Heart className="w-4 h-4 fill-current text-accent" />
                  ) : (
                    <HeartIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {formatDate(toolkit.created_at)}
                  </Badge>
                  {toolkit.favorite && (
                    <Badge variant="secondary" className="text-xs">
                      Favorite
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(toolkit)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyAll(toolkit)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(toolkit)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendToBuilder(toolkit)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(toolkit)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ToolkitDrawer
        toolkit={selectedToolkit}
        open={showDrawer}
        onOpenChange={setShowDrawer}
        onSendToBuilder={handleSendToBuilder}
        onCopyAll={handleCopyAll}
        onDownload={handleDownload}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="destructive"
      />
    </>
  );
};