import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface CareerCoachWidgetProps {
  className?: string;
}

export const CareerCoachWidget = ({ className }: CareerCoachWidgetProps) => {
  // Mock AI coach data - in real app would come from AI analysis
  const coachData = {
    weeklyGoals: {
      applications: { current: 3, target: 5, progress: 60 },
      networking: { current: 2, target: 3, progress: 67 },
      interviews: { current: 1, target: 2, progress: 50 }
    },
    recommendations: [
      {
        type: 'skill',
        priority: 'high',
        title: 'Learn TypeScript',
        description: 'TypeScript is mentioned in 78% of React jobs',
        action: 'Start Learning',
        timeEstimate: '2 weeks'
      },
      {
        type: 'networking',
        priority: 'medium',
        title: 'Connect with 3 Senior Engineers',
        description: 'Expand your network in target companies',
        action: 'Find Connections',
        timeEstimate: '1 week'
      },
      {
        type: 'application',
        priority: 'high',
        title: 'Apply to 2 More Positions',
        description: 'You\'re behind your weekly application goal',
        action: 'Browse Jobs',
        timeEstimate: '2 hours'
      }
    ],
    insights: [
      'Your resume gets 23% more views when you include "React" in the title',
      'Applications sent on Tuesday-Thursday get 31% more responses',
      'Your interview-to-offer rate is 67% - above average!'
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Target;
      case 'low': return CheckCircle;
      default: return Lightbulb;
    }
  };

  return (
    <Card className={`card-elegant ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          AI Career Coach
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized guidance for your job search
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Weekly Goals Progress */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">This Week's Progress</h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Applications Sent</span>
                <span className="font-medium">
                  {coachData.weeklyGoals.applications.current}/{coachData.weeklyGoals.applications.target}
                </span>
              </div>
              <Progress value={coachData.weeklyGoals.applications.progress} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Networking Touches</span>
                <span className="font-medium">
                  {coachData.weeklyGoals.networking.current}/{coachData.weeklyGoals.networking.target}
                </span>
              </div>
              <Progress value={coachData.weeklyGoals.networking.progress} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Interviews Scheduled</span>
                <span className="font-medium">
                  {coachData.weeklyGoals.interviews.current}/{coachData.weeklyGoals.interviews.target}
                </span>
              </div>
              <Progress value={coachData.weeklyGoals.interviews.progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Recommended Actions</h4>
          
          <div className="space-y-2">
            {coachData.recommendations.slice(0, 2).map((rec, index) => {
              const PriorityIcon = getPriorityIcon(rec.priority);
              return (
                <div key={index} className="p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{rec.title}</span>
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{rec.timeEstimate}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      {rec.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Insight */}
        <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-accent mt-0.5" />
            <div>
              <p className="text-sm font-medium text-accent-foreground">Today's Insight</p>
              <p className="text-xs text-accent-foreground/80 mt-1">
                {coachData.insights[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" className="w-full" size="sm">
          <Brain className="h-4 w-4 mr-2" />
          Get Full Career Analysis
        </Button>
      </CardContent>
    </Card>
  );
};