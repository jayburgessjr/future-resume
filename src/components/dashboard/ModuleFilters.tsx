"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDataStore } from "@/stores";

export const ModuleFilters = () => {
  const { settings, updateSettings } = useAppDataStore();

  return (
    <Card className="border-dashed border-border/50">
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="mode">Mode</Label>
            <Select
              value={settings.mode}
              onValueChange={(value) => updateSettings({ mode: value as typeof settings.mode })}
            >
              <SelectTrigger id="mode" className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice">Voice</Label>
            <Select
              value={settings.voice}
              onValueChange={(value) => updateSettings({ voice: value as typeof settings.voice })}
            >
              <SelectTrigger id="voice" className="w-full">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-person">First Person</SelectItem>
                <SelectItem value="third-person">Third Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select
              value={settings.format}
              onValueChange={(value) => updateSettings({ format: value as typeof settings.format })}
            >
              <SelectTrigger id="format" className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain_text">Plain Text</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
            <div className="space-y-1">
              <Label className="text-sm">Include Skills Table</Label>
              <p className="text-xs text-muted-foreground">Adds a structured skills view</p>
            </div>
            <Switch
              checked={settings.includeTable}
              onCheckedChange={(checked) => updateSettings({ includeTable: checked })}
              aria-label="Toggle skills table"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
            <div className="space-y-1">
              <Label className="text-sm">Proofread</Label>
              <p className="text-xs text-muted-foreground">Run grammar scan</p>
            </div>
            <Switch
              checked={settings.proofread}
              onCheckedChange={(checked) => updateSettings({ proofread: checked })}
              aria-label="Toggle proofreading"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
