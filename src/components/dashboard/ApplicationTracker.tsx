import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  Building,
  Mail,
  Phone,
  Plus
} from 'lucide-react';

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
  lastUpdate: string;
  nextAction?: string;
  nextActionDate?: string;
}

interface ApplicationTrackerProps {
  className?: string;
}

export const ApplicationTracker = ({ className }: ApplicationTrackerProps) => {
  // Mock application data
  const applications: Application[] = [
    {
      id: '1',
      company: 'TechFlow Solutions',
      position: 'Senior Software Engineer',
      status: 'interview',
      appliedDate: '2024-01-15',
      lastUpdate: '2024-01-18',
      nextAction: 'Final Interview',
      nextActionDate: '2024-01-22'
    },
    {
      id: '2',
      company: 'InnovateLab Inc.',
      position: 'Full Stack Developer',
      status: 'screening',
      appliedDate: '2024-01-12',
      lastUpdate: '2024-01-16',
      nextAction: 'Phone Screen',
      nextActionDate: '2024-01-20'
    },
    {
      id: '3',
      company: 'CloudSync Technologies',
      position: 'Frontend Engineer',
      status: 'applied',
      appliedDate: '2024-01-10',
      lastUpdate: '2024-01-10'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return Clock;
      case 'screening': return Phone;
      case 'interview': return Calendar;
      case 'offer': return CheckCircle;
      case 'rejected': return XCircle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'screening': return 'Phone Screen';
      case 'interview': return 'Interview';
      case 'offer': return 'Offer Received';
      case 'rejected': return 'Not Selected';
      default: return status;
    }
  };

  // Calculate pipeline stats
  const pipelineStats = {
    total: applications.length,
    active: applications.filter(app => !['offer', 'rejected'].includes(app.status)).length,
    interviews: applications.filter(app => app.status === 'interview').length,
    offers: applications.filter(app => app.status === 'offer').length
  };

  return (
    <Card className={`card-elegant ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Application Pipeline
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pipeline Overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{pipelineStats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{pipelineStats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{pipelineStats.interviews}</div>
            <div className="text-xs text-muted-foreground">Interviews</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{pipelineStats.offers}</div>
            <div className="text-xs text-muted-foreground">Offers</div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recent Applications</h4>
          
          <div className="space-y-2">
            {applications.slice(0, 3).map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <div key={app.id} className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{app.company}</span>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {getStatusLabel(app.status)}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">{app.position}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                    </div>
                    
                    {app.nextAction && (
                      <div className="text-xs">
                        <span className="text-accent font-medium">{app.nextAction}</span>
                        {app.nextActionDate && (
                          <span className="text-muted-foreground ml-1">
                            {new Date(app.nextActionDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="h-4 w-4 mr-1" />
            Follow Up
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};