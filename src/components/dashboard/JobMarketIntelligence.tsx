import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building, 
  ExternalLink,
  Star,
  AlertCircle,
  Target
} from 'lucide-react';

interface JobMarketIntelligenceProps {
  userRole?: string;
  userLocation?: string;
}

export const JobMarketIntelligence = ({ 
  userRole = "Software Engineer", 
  userLocation = "San Francisco, CA" 
}: JobMarketIntelligenceProps) => {
  // Mock data - in real app would come from job market APIs
  const marketData = {
    salaryRange: { min: 120000, max: 180000, median: 150000 },
    demandScore: 85, // out of 100
    competitionLevel: 'Medium',
    openPositions: 1247,
    trendingSkills: [
      { skill: 'React', demand: 95, growth: '+12%' },
      { skill: 'TypeScript', demand: 88, growth: '+18%' },
      { skill: 'Node.js', demand: 82, growth: '+8%' },
      { skill: 'AWS', demand: 79, growth: '+15%' },
      { skill: 'Docker', demand: 71, growth: '+22%' }
    ],
    topCompanies: [
      { name: 'Google', openings: 45, avgSalary: 165000 },
      { name: 'Meta', openings: 32, avgSalary: 172000 },
      { name: 'Apple', openings: 28, avgSalary: 158000 },
      { name: 'Microsoft', openings: 41, avgSalary: 155000 }
    ]
  };

  const getDemandColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="card-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Job Market Intelligence
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {userRole} • {userLocation}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Market Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Salary Range</span>
            </div>
            <div className="text-lg font-bold">
              ${(marketData.salaryRange.min / 1000).toFixed(0)}k - ${(marketData.salaryRange.max / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground">
              Median: ${(marketData.salaryRange.median / 1000).toFixed(0)}k
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Market Demand</span>
            </div>
            <div className={`text-lg font-bold ${getDemandColor(marketData.demandScore)}`}>
              {marketData.demandScore}/100
            </div>
            <Badge className={getCompetitionColor(marketData.competitionLevel)}>
              {marketData.competitionLevel} Competition
            </Badge>
          </div>
        </div>

        {/* Trending Skills */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-accent" />
            Trending Skills
          </h4>
          <div className="space-y-2">
            {marketData.trendingSkills.slice(0, 3).map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{skill.skill}</span>
                  <Badge variant="outline" className="text-xs text-green-600">
                    {skill.growth}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={skill.demand} className="w-16 h-2" />
                  <span className="text-xs text-muted-foreground">{skill.demand}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hiring Companies */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            Top Hiring Companies
          </h4>
          <div className="space-y-2">
            {marketData.topCompanies.slice(0, 3).map((company) => (
              <div key={company.name} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{company.name}</p>
                  <p className="text-xs text-muted-foreground">{company.openings} openings</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(company.avgSalary / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">avg salary</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button variant="outline" className="w-full" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Market Report
        </Button>
      </CardContent>
    </Card>
  );
};