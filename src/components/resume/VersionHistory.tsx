import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePersistenceStore } from '@/stores/persistenceStore';
import { useAppDataStore } from '@/stores/appData';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Download, RotateCcw, FileText } from 'lucide-react';

export function VersionHistory() {
  const { versions, loading, restoreVersion } = usePersistenceStore();
  const { updateInputs, updateSettings } = useAppDataStore();
  const { toast } = useToast();
  const [restoring, setRestoring] = useState<string | null>(null);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const version = await restoreVersion(versionId);
      if (version) {
        // Update app store with restored data
        updateInputs(version.inputs);
        updateSettings(version.settings as any); // Type assertion for settings
        
        toast({
          title: "Version Restored",
          description: "Resume data has been restored to this version",
        });
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Failed to restore this version",
        variant: "destructive",
      });
    } finally {
      setRestoring(null);
    }
  };

  const handleDownload = (version: any, format: 'txt' | 'md') => {
    const content = format === 'md' ? version.outputs.resume : 
      version.outputs.resume.replace(/#{1,6}\s*/g, '').replace(/\*\*(.*?)\*\*/g, '$1');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${version.created_at.split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `Resume saved as .${format} file`,
    });
  };

  if (loading) {
    return (
      <Card className="card-elegant">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="card-elegant">
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Versions Yet</h3>
          <p className="text-muted-foreground">
            Generate a resume to create your first version
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-elegant">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Version History
        </h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versions.map((version, index) => (
            <div 
              key={version.id}
              className="p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                    {index === 0 ? 'Latest' : `Version ${versions.length - index}`}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {version.settings.mode}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {version.settings.voice}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                </span>
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                <p className="truncate">
                  Job: {version.inputs.jobText.slice(0, 60)}...
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleRestore(version.id)}
                  disabled={restoring === version.id}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {restoring === version.id ? 'Restoring...' : 'Restore'}
                </Button>
                <Button
                  onClick={() => handleDownload(version, 'txt')}
                  variant="ghost"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  .txt
                </Button>
                <Button
                  onClick={() => handleDownload(version, 'md')}
                  variant="ghost"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  .md
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}