import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Bell, Palette, Shield, Save } from 'lucide-react';

interface UserPreferences {
  // Resume Generation
  defaultMode: 'concise' | 'detailed' | 'executive';
  defaultVoice: 'first-person' | 'third-person';
  defaultFormat: 'markdown' | 'plain_text' | 'json';
  autoSaveFrequency: number; // minutes
  
  // Notifications
  emailJobMatches: boolean;
  weeklyReports: boolean;
  renewalReminders: boolean;
  featureUpdates: boolean;
  
  // Dashboard
  dashboardLayout: 'grid' | 'list';
  informationDensity: 'compact' | 'comfortable' | 'spacious';
  defaultView: 'overview' | 'jobs' | 'toolkits';
  
  // Privacy
  analyticsOptIn: boolean;
  shareResumes: boolean;
  dataRetention: '1year' | '2years' | 'indefinite';
}

const defaultPreferences: UserPreferences = {
  defaultMode: 'detailed',
  defaultVoice: 'first-person',
  defaultFormat: 'plain_text',
  autoSaveFrequency: 5,
  emailJobMatches: true,
  weeklyReports: true,
  renewalReminders: true,
  featureUpdates: false,
  dashboardLayout: 'grid',
  informationDensity: 'comfortable',
  defaultView: 'overview',
  analyticsOptIn: true,
  shareResumes: false,
  dataRetention: '2years'
};

interface UserPreferencesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserPreferencesPanel = ({ open, onOpenChange }: UserPreferencesPanelProps) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load preferences from localStorage or API
    const saved = localStorage.getItem('user-preferences');
    if (saved) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in real app, would save to database)
      localStorage.setItem('user-preferences', JSON.stringify(preferences));
      
      setHasChanges(false);
      toast({
        title: "Preferences Saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-xl">User Preferences</CardTitle>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                ×
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-[70vh]">
            <Tabs defaultValue="generation" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                <TabsTrigger value="generation">Resume</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
              </TabsList>

              <div className="p-6">
                <TabsContent value="generation" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Resume Generation Defaults
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default Resume Mode</Label>
                        <Select 
                          value={preferences.defaultMode} 
                          onValueChange={(value) => updatePreference('defaultMode', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concise">Concise (≤350 words)</SelectItem>
                            <SelectItem value="detailed">Detailed (≤550 words)</SelectItem>
                            <SelectItem value="executive">Executive (≤450 words)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Default Voice Style</Label>
                        <Select 
                          value={preferences.defaultVoice} 
                          onValueChange={(value) => updatePreference('defaultVoice', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first-person">First Person (I, my, me)</SelectItem>
                            <SelectItem value="third-person">Third Person (candidate, they)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Default Export Format</Label>
                        <Select 
                          value={preferences.defaultFormat} 
                          onValueChange={(value) => updatePreference('defaultFormat', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plain_text">Plain Text</SelectItem>
                            <SelectItem value="markdown">Markdown</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Auto-save Frequency</Label>
                        <Select 
                          value={preferences.autoSaveFrequency.toString()} 
                          onValueChange={(value) => updatePreference('autoSaveFrequency', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Every minute</SelectItem>
                            <SelectItem value="5">Every 5 minutes</SelectItem>
                            <SelectItem value="10">Every 10 minutes</SelectItem>
                            <SelectItem value="30">Every 30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Job Match Alerts</Label>
                          <p className="text-sm text-muted-foreground">Get notified when new jobs match your profile</p>
                        </div>
                        <Switch
                          checked={preferences.emailJobMatches}
                          onCheckedChange={(checked) => updatePreference('emailJobMatches', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Weekly Progress Reports</Label>
                          <p className="text-sm text-muted-foreground">Receive weekly job search analytics</p>
                        </div>
                        <Switch
                          checked={preferences.weeklyReports}
                          onCheckedChange={(checked) => updatePreference('weeklyReports', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Subscription Reminders</Label>
                          <p className="text-sm text-muted-foreground">Renewal and billing notifications</p>
                        </div>
                        <Switch
                          checked={preferences.renewalReminders}
                          onCheckedChange={(checked) => updatePreference('renewalReminders', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Feature Updates</Label>
                          <p className="text-sm text-muted-foreground">New features and product announcements</p>
                        </div>
                        <Switch
                          checked={preferences.featureUpdates}
                          onCheckedChange={(checked) => updatePreference('featureUpdates', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Dashboard Customization
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Layout Style</Label>
                        <Select 
                          value={preferences.dashboardLayout} 
                          onValueChange={(value) => updatePreference('dashboardLayout', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid View</SelectItem>
                            <SelectItem value="list">List View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Information Density</Label>
                        <Select 
                          value={preferences.informationDensity} 
                          onValueChange={(value) => updatePreference('informationDensity', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compact">Compact</SelectItem>
                            <SelectItem value="comfortable">Comfortable</SelectItem>
                            <SelectItem value="spacious">Spacious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Default View</Label>
                        <Select 
                          value={preferences.defaultView} 
                          onValueChange={(value) => updatePreference('defaultView', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="overview">Overview</SelectItem>
                            <SelectItem value="jobs">Jobs</SelectItem>
                            <SelectItem value="toolkits">Toolkits</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="privacy" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy & Data Controls
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Analytics & Usage Data</Label>
                          <p className="text-sm text-muted-foreground">Help improve the product with anonymous usage data</p>
                        </div>
                        <Switch
                          checked={preferences.analyticsOptIn}
                          onCheckedChange={(checked) => updatePreference('analyticsOptIn', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Resume Sharing</Label>
                          <p className="text-sm text-muted-foreground">Allow sharing resumes with mentors and reviewers</p>
                        </div>
                        <Switch
                          checked={preferences.shareResumes}
                          onCheckedChange={(checked) => updatePreference('shareResumes', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Data Retention Period</Label>
                        <Select 
                          value={preferences.dataRetention} 
                          onValueChange={(value) => updatePreference('dataRetention', value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1year">1 Year</SelectItem>
                            <SelectItem value="2years">2 Years</SelectItem>
                            <SelectItem value="indefinite">Indefinite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CardContent>

        <div className="border-t p-4 flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {saving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};