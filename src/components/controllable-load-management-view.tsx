
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, PlusCircle, Search, LayoutDashboard, SlidersHorizontal, Calendar, TrendingUp, CreditCard, Users } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import type { DetailedCustomer } from "@/lib/types";
import { SchedulerView } from "./scheduler-view";

interface ControllableLoadManagementViewProps {
    onSelectIcp: (id: DetailedCustomer | null) => void;
    onBack: () => void;
}

export function ControllableLoadManagementView({ onSelectIcp, onBack }: ControllableLoadManagementViewProps) {
  const [activeTab, setActiveTab] = useState("scheduler");

  const TABS = [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "operations", label: "Operations", icon: SlidersHorizontal },
      { id: "planning", label: "Planning", icon: TrendingUp },
      { id: "scheduler", label: "Scheduler", icon: Calendar },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "customer", label: "Customer", icon: Users },
  ];
  return (
    <div className="flex-1 flex flex-col h-full p-4 md:p-6">
        <div className="flex-shrink-0 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Controllable Load Management</h1>
            <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back to DER Home</Button>
        </div>
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-4 min-h-0">
        <div className="border-b">
            <TabsList className="h-14 p-0 bg-transparent">
                {TABS.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative h-full rounded-none border-b-2 border-transparent",
                      "data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                      "px-4 -mb-px hover:text-white hover:border-orange-400",
                      activeTab !== tab.id && "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <tab.icon className="mr-2 h-5 w-5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
            </TabsList>
        </div>
        <TabsContent value="overview" className="flex-1 mt-4 bg-muted/30">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>High-level summary of controllable loads.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Overview content goes here. This could include charts on load capacity, active programs, and overall grid impact.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="operations" className="flex-1 mt-4 bg-muted/30">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Operations</CardTitle>
                    <CardDescription>Real-time monitoring and control.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Operations content goes here. This could include a map of active loads, control panels for demand response events, and real-time telemetry.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="planning" className="flex-1 mt-4 bg-muted/30">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Planning</CardTitle>
                    <CardDescription>Forecast and plan for future demand response.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Planning content goes here. This could include forecasting tools, scenario modeling, and program enrollment statistics.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="scheduler" className="flex-1 flex flex-col min-h-0 bg-muted/30 overflow-hidden">
            <div className={cn("flex-1 flex flex-col min-h-0 transition-all duration-300")}>
                 <SchedulerView onSelectIcp={onSelectIcp} />
            </div>
        </TabsContent>
        <TabsContent value="billing" className="flex-1 mt-4 bg-muted/30">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Billing</CardTitle>
                    <CardDescription>Handle billing and settlements for DER programs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Billing content goes here. This could include settlement reports, payment tracking, and integration with financial systems.</p>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="customer" className="flex-1 mt-4 bg-muted/30">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Customer</CardTitle>
                    <CardDescription>Manage customer participation and communication.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Customer content goes here. This could include customer enrollment forms, communication tools, and performance dashboards.</p>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
</div>
  );
}
