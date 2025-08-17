import { useState } from "react";
import { JobCard } from "./JobCard";
import { EmptyState } from "./EmptyState";
import { Job } from "@/stores/dashboardStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus } from "lucide-react";

interface JobListProps {
  jobs: Job[];
  onCreateNew: () => void;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onCompare: (job: Job) => void;
  onSendToBuilder: (job: Job) => void;
  onArchive: (job: Job) => void;
  onDelete: (job: Job) => void;
}

export const JobList = ({ 
  jobs, 
  onCreateNew, 
  onView, 
  onEdit, 
  onCompare, 
  onSendToBuilder, 
  onArchive, 
  onDelete 
}: JobListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags from jobs
  const allTags = Array.from(
    new Set(jobs.flatMap(job => job.tags || []))
  ).sort();

  // Filter jobs based on search term and selected tags
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => job.tags?.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTags([]);
  };

  if (jobs.length === 0) {
    return <EmptyState type="jobs" onAction={onCreateNew} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button onClick={onCreateNew} className="bg-gradient-to-r from-primary to-accent text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by tags:</span>
            {selectedTags.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent/10"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredJobs.length} of {jobs.length} jobs
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedTags.length > 0 && ` with tags: ${selectedTags.join(", ")}`}
        </p>
      </div>

      {/* Job cards */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No jobs match your current filters.</p>
          <Button variant="outline" onClick={clearFilters} className="mt-2">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onView={onView}
              onEdit={onEdit}
              onCompare={onCompare}
              onSendToBuilder={onSendToBuilder}
              onArchive={onArchive}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};