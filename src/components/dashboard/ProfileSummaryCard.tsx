"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useProfileStore } from "@/stores";
import { useAuth } from "@/hooks/useAuth";

export const ProfileSummaryCard = () => {
  const { user } = useAuth();
  const { displayName, jobTitle, northStar, headline, updateProfile } = useProfileStore();

  useEffect(() => {
    if (!displayName) {
      const fallbackName =
        (user?.user_metadata?.full_name as string | undefined)?.trim() ||
        (user?.email ? user.email.split("@")[0] : "");
      if (fallbackName) {
        updateProfile({ displayName: fallbackName });
      }
    }
  }, [displayName, updateProfile, user]);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Career North Star</CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalize the workspace so every module reflects your goals.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Name</Label>
            <Input
              id="displayName"
              value={displayName}
              placeholder="Add your name"
              onChange={(event) => updateProfile({ displayName: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Target Role</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              placeholder="Product Marketing Lead, Staff Engineer, etc."
              onChange={(event) => updateProfile({ jobTitle: event.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="headline">Brand Statement</Label>
          <Input
            id="headline"
            value={headline}
            placeholder="Outcome-driven product storyteller | GTM strategist"
            onChange={(event) => updateProfile({ headline: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="northStar">North Star</Label>
          <Textarea
            id="northStar"
            value={northStar}
            placeholder="Describe the impact you want to create next."
            onChange={(event) => updateProfile({ northStar: event.target.value })}
            className="min-h-[100px]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {displayName && <Badge variant="secondary">{displayName}</Badge>}
          {jobTitle && <Badge variant="outline">Role: {jobTitle}</Badge>}
          {headline && <Badge variant="outline">{headline}</Badge>}
          {northStar && <Badge variant="secondary">North Star set</Badge>}
        </div>
      </CardContent>
    </Card>
  );
};
