import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Edit, 
  Eye, 
  Copy, 
  Crown, 
  Calendar,
  MoreHorizontal,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Resume } from "@/stores/dashboardStore";
import { useNavigate } from "react-router-dom";

interface MasterResumeCardProps {
  resume: Resume | null;
  onCreateNew: () => void;
  onView: (resume: Resume) => void;
  onCreateVersion: (resume: Resume) => void;
  onExport: (resume: Resume) => void;
}

export const MasterResumeCard = ({ 
  resume, 
  onCreateNew, 
  onView, 
  onCreateVersion,
  onExport 
}: MasterResumeCardProps) => {
  const navigate = useNavigate();

  if (!resume) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Master Résumé</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your master résumé to get started with targeted applications.
          </p>
          <Button onClick={onCreateNew} className="bg-gradient-to-r from-primary to-accent text-white">
            <FileText className="h-4 w-4 mr-2" />
            Create Master Résumé
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleEditInBuilder = () => {
    navigate('/builder');
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{resume.title}</CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary mt-1">
                Master Résumé
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(resume)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditInBuilder}>
                <Edit className="h-4 w-4 mr-2" />
                Edit in Builder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateVersion(resume)}>
                <Copy className="h-4 w-4 mr-2" />
                Create Version
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport(resume)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Updated {format(new Date(resume.updated_at), "MMM d, yyyy")}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(resume)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button 
            size="sm" 
            onClick={handleEditInBuilder}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit in Builder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};