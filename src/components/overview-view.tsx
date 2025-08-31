
"use client";

import type { GridAsset, Alert } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, ShieldCheck, AlertTriangle, XCircle, Activity, Bell, Shield, ShieldAlert, ShieldX, ShieldQuestion } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type OverviewViewProps = {
  assets: GridAsset[];
  alerts: Alert[];
};

const getRiskColor = (score: number) => {
  if (score > 75) return "bg-destructive";
  if (score > 50) return "bg-accent";
  if (score > 25) return "bg-yellow-500";
  return "bg-green-500";
};

export function OverviewView({ assets, alerts }: OverviewViewProps) {
  const totalAssets = assets.length;
  const operationalAssets = assets.filter(a => a.status === 'Operational').length;
  const warningAssets = assets.filter(a => a.status === 'Warning').length;
  const offlineAssets = assets.filter(a => a.status === 'Offline').length;
  
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical').length;
  const highAlerts = alerts.filter(a => a.severity === 'High').length;

  const averageRiskScore = totalAssets > 0 ? Math.round(assets.reduce((sum, asset) => sum + asset.riskScore, 0) / totalAssets) : 0;
  
  const riskCounts = {
    low: assets.filter(a => a.riskScore <= 25).length,
    medium: assets.filter(a => a.riskScore > 25 && a.riskScore <= 50).length,
    high: assets.filter(a => a.riskScore > 50 && a.riskScore <= 75).length,
    critical: assets.filter(a => a.riskScore > 75).length,
  };
  

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAssets}</div>
                    <p className="text-xs text-muted-foreground">monitored grid components</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAlerts}</div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-destructive font-semibold">{criticalAlerts} critical</span>, <span className="text-accent font-semibold">{highAlerts} high</span>
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Operational Status</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{operationalAssets}</div>
                    <p className="text-xs text-muted-foreground">
                       <span className="text-yellow-500">{warningAssets} warnings</span>, <span className="text-muted-foreground">{offlineAssets} offline</span>
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Risk Score</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{averageRiskScore}%</div>
                    <Progress value={averageRiskScore} className="h-2 mt-2" indicatorClassName={getRiskColor(averageRiskScore)} />
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Asset Risk Distribution</CardTitle>
                    <CardDescription>Number of assets by risk score category.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <ShieldX className="h-5 w-5 text-destructive mr-4" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>Critical Risk (76-100)</span>
                                <span>{riskCounts.critical} / {totalAssets}</span>
                            </div>
                            <Progress value={(riskCounts.critical / totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-destructive" />
                        </div>
                    </div>
                     <div className="flex items-center">
                        <ShieldAlert className="h-5 w-5 text-accent mr-4" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>High Risk (51-75)</span>
                                <span>{riskCounts.high} / {totalAssets}</span>
                            </div>
                            <Progress value={(riskCounts.high / totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-accent" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <ShieldQuestion className="h-5 w-5 text-yellow-500 mr-4" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>Medium Risk (26-50)</span>
                                <span>{riskCounts.medium} / {totalAssets}</span>
                            </div>
                            <Progress value={(riskCounts.medium / totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-yellow-500" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-4" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>Low Risk (0-25)</span>
                                <span>{riskCounts.low} / {totalAssets}</span>
                            </div>
                            <Progress value={(riskCounts.low / totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-green-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Asset Status Overview</CardTitle>
                    <CardDescription>A summary of asset operational states.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <ShieldCheck className="h-5 w-5 text-green-500 mr-4"/>
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>Operational</span>
                                <span>{operationalAssets} / {totalAssets}</span>
                            </div>
                            <Progress value={(operationalAssets/totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-green-500" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-4"/>
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>Warning</span>
                                <span>{warningAssets} / {totalAssets}</span>
                            </div>
                            <Progress value={(warningAssets/totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-yellow-500" />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-muted-foreground mr-4"/>
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span>Offline</span>
                                <span>{offlineAssets} / {totalAssets}</span>
                            </div>
                            <Progress value={(offlineAssets/totalAssets) * 100} className="h-2 mt-1" indicatorClassName="bg-muted-foreground" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
