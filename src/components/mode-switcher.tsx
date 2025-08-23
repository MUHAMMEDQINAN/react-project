
"use client";

import { useAppMode } from "@/hooks/use-app-mode";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Server, Database } from "lucide-react";
import { Card } from "./ui/card";

export function ModeSwitcher() {
  const { mode, setMode, isLocked } = useAppMode();

  if (isLocked) {
    return (
      <div className="text-xs text-muted-foreground p-2 rounded-lg border bg-muted/50">
        Mode is locked to <span className="font-bold capitalize">{mode}</span>.
      </div>
    );
  }

  return (
    <Card className="p-2">
      <div className="flex items-center space-x-3">
        <Label htmlFor="mode-toggle" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
          <Database className="h-5 w-5" />
          <span>Sandbox</span>
        </Label>
        <Switch
          id="mode-toggle"
          checked={mode === 'production'}
          onCheckedChange={(checked) => setMode(checked ? 'production' : 'sandbox')}
        />
        <Label htmlFor="mode-toggle" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
          <Server className="h-5 w-5" />
          <span>Production</span>
        </Label>
      </div>
    </Card>
  );
}
