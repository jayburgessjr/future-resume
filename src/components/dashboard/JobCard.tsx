import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Calendar, 
  Eye, 
  Edit, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  TrendingUp,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Job } from "@/stores/dashboardStore";

interface JobCardProps {
  job: Job;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onCompare: (job: Job) => void;
  onSendToBuilder: (job: Job) => void;
  onArchive: (job: Job) => void;
  onDelete: (job: Job) => void;
}

export const JobCard = ({ 
  job, 
  onView, 
  onEdit, 
  onCompare, 
  onSendToBuilder, 
  onArchive, 
  onDelete 
}: JobCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription = job.description.length > 150 
    ? job.description.substring(0, 150) + "..."
    : job.description;

  return (
    <Card className="card-interactive group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight">{job.title}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{job.company}</p>
              
              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {job.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(job)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCompare(job)}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Compare to Master
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendToBuilder(job)}>
                <Send className="h-4 w-4 mr-2" />
                Send to Builder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive(job)}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(job)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          {isExpanded ? job.description : truncatedDescription}
          {job.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:underline ml-1"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(job.created_at), "MMM d, yyyy")}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onCompare(job)}>
              <TrendingUp className="h-4 w-4 mr-1" />
              Gap
            </Button>
            <Button size="sm" onClick={() => onSendToBuilder(job)}>
              <Send className="h-4 w-4 mr-1" />
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};