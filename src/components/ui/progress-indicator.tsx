import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, Sparkles } from 'lucide-react';

export interface ProgressPhase {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // seconds
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  phases: ProgressPhase[];
  currentPhase?: string;
  totalProgress: number; // 0-100
  showDetails?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  phases,
  currentPhase,
  totalProgress,
  showDetails = true,
  className = ''
}) => {
  const getPhaseIcon = (phase: ProgressPhase) => {
    switch (phase.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <div className="w-4 h-4 bg-red-600 rounded-full" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProgressPhase['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const progressPercent = Math.round((completedPhases / phases.length) * 100);

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold">AI Processing</h3>
          </div>
          <Badge variant="outline" className="text-sm">
            {completedPhases}/{phases.length} phases
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Overall Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {showDetails && (
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                  phase.status === 'active' ? 'bg-accent/5 border-accent/20' : 'bg-background'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getPhaseIcon(phase)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {phase.title}
                    </h4>
                     <Badge className={`text-xs ${getStatusColor(phase.status)}`}>
                       {phase.status === 'active' ? 'processing' : phase.status}
                     </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {phase.description}
                  </p>
                  
                  {phase.status === 'active' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Estimated: {phase.estimatedDuration}s</span>
                      </div>
                      <Progress value={totalProgress} className="h-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center text-sm text-muted-foreground pt-2">
          <span>🤖 Powered by AI • Optimizing for ATS compatibility</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Progress indicator hook for easier state management
// eslint-disable-next-line react-refresh/only-export-components
export const useProgressIndicator = (initialPhases: ProgressPhase[]) => {
  const [phases, setPhases] = React.useState<ProgressPhase[]>(initialPhases);
  const [currentPhase, setCurrentPhase] = React.useState<string | undefined>();

  const updatePhase = React.useCallback((phaseId: string, status: ProgressPhase['status']) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, status } : phase
    ));
  }, []);

  const setActivePhase = React.useCallback((phaseId: string) => {
    setCurrentPhase(phaseId);
    updatePhase(phaseId, 'active');
  }, [updatePhase]);

  const completePhase = React.useCallback((phaseId: string) => {
    updatePhase(phaseId, 'completed');
  }, [updatePhase]);

  const errorPhase = React.useCallback((phaseId: string) => {
    updatePhase(phaseId, 'error');
  }, [updatePhase]);

  const resetPhases = React.useCallback(() => {
    setPhases(prev => prev.map(phase => ({ ...phase, status: 'pending' as const })));
    setCurrentPhase(undefined);
  }, []);

  const totalProgress = React.useMemo(() => {
    const completed = phases.filter(p => p.status === 'completed').length;
    return Math.round((completed / phases.length) * 100);
  }, [phases]);

  return {
    phases,
    currentPhase,
    totalProgress,
    setActivePhase,
    completePhase,
    errorPhase,
    resetPhases,
    updatePhase
  };
};