
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { GridAsset, Alert } from '@/lib/types';
import { AnomalyDetectionView } from '@/components/anomaly-detection-view';
import { ReportingView } from '@/components/reporting-view';
import { OverviewView } from '@/components/overview-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Map, Bell, Bot, FileText, AlertTriangle, Info, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/lib/rbac';

const getSeverityStyles = (severity: Alert['severity']) => {
  switch (severity) {
    case 'Critical': return {
      badge: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
      row: "bg-destructive/10"
    };
    case 'High': return {
      badge: "bg-accent text-accent-foreground hover:bg-accent/90",
      icon: <AlertTriangle className="h-4 w-4 text-accent" />,
      row: "bg-accent/10"
    };
    case 'Medium': return {
      badge: "bg-yellow-500 text-yellow-500-foreground hover:bg-yellow-500/90",
      icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
      row: ""
    };
    case 'Low': return {
      badge: "bg-blue-500 text-blue-500-foreground hover:bg-blue-500/90",
      icon: <Info className="h-4 w-4 text-blue-500" />,
      row: ""
    };
    default: return {
      badge: "bg-muted text-muted-foreground",
      icon: <Info className="h-4 w-4 text-muted-foreground" />,
      row: ""
    };
  }
};

interface ExplorerViewProps {
  assets: GridAsset[];
  alerts: Alert[];
  isLoading: boolean;
  selectedAssets: GridAsset[];
  onSelectAsset: (asset: GridAsset | null, isMultiSelect?: boolean) => void;
  onSpatialSelect: (assets: GridAsset[]) => void;
}

const ALL_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'anomaly', label: 'Anomaly Detection', icon: Bot },
  { id: 'reporting', label: 'Reporting', icon: FileText },
];

export function ExplorerView({ assets, alerts, isLoading, selectedAssets, onSelectAsset, onSpatialSelect }: ExplorerViewProps) {
  const { participant } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const visibleTabs = useMemo(() => {
      if (!participant) return [];
      return ALL_TABS.filter(tab => hasPermission(participant, 'tab', tab.id));
  }, [participant]);

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, activeTab]);

  const handleSelectAssetCallback = useCallback(onSelectAsset, [onSelectAsset]);

  useEffect(() => {
    if (activeTab !== 'map') {
      handleSelectAssetCallback(null);
    }
  }, [activeTab, handleSelectAssetCallback]);

  const sortedAlerts = useMemo(() => {
    const severityOrder: Record<Alert['severity'], number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    return [...alerts].sort((a, b) => {
      if (severityOrder[b.severity] !== severityOrder[a.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts]);

  const renderLoadingSkeleton = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><Skeleton className="h-6 w-1/2" /></div>
              <div className="text-xs text-muted-foreground mt-2">
                <Skeleton className="h-3 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
            <div className="text-sm text-muted-foreground pt-1.5"><Skeleton className="h-4 w-1/2" /></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div className="flex items-center" key={i}>
                <Skeleton className="h-5 w-5 mr-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
            <div className="text-sm text-muted-foreground pt-1.5"><Skeleton className="h-4 w-1/2" /></div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div className="flex items-center" key={i}>
                <Skeleton className="h-5 w-5 mr-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const DynamicMapView = useMemo(
    () => dynamic(() => import('@/components/map-view').then(mod => mod.MapView), {
      ssr: false,
      loading: () => <Skeleton className="h-full w-full bg-muted" />,
    }),
    []
  );

  return (
    <div className="flex flex-col flex-1 h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="h-14 p-0 bg-transparent">
            {visibleTabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "relative h-full rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-orange-500 data-[state=active]:bg-orange data-[state=active]:shadow-none",
                  "px-4 -mb-px hover:text-white hover:border-orange-400",
                  activeTab !== tab.id && "hover:bg-accent hover:text-accent-foreground" // Only apply if NOT active
                )}
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.label}
                {tab.id === 'alerts' && !isLoading && alerts.length > 0 && (
                  <Badge className="absolute top-2 right-0 h-5 w-5 p-0 justify-center">
                    {alerts.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 relative">
          <TabsContent value="overview" className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-muted/30">
            {isLoading ? renderLoadingSkeleton : <OverviewView assets={assets} alerts={alerts} />}
          </TabsContent>

          <TabsContent value="map" className="absolute inset-0">
            {isLoading ? <Skeleton className="h-full w-full bg-muted" /> : <DynamicMapView assets={assets} alerts={alerts} onSelectAsset={onSelectAsset} selectedAssets={selectedAssets} onSpatialSelect={onSpatialSelect} />}
          </TabsContent>

          <TabsContent value="alerts" className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-muted/30">
            {isLoading ? <Skeleton className="h-full w-full" /> : (
              <Card>
                <CardHeader>
                  <CardTitle>Active Alerts</CardTitle>
                  <CardDescription>Critical events and warnings from across the grid.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Severity</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="text-right">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAlerts.map(alert => {
                        const styles = getSeverityStyles(alert.severity);
                        return (
                          <TableRow key={alert.id} className={cn(styles.row)}>
                            <TableCell>
                              <Badge className={cn("capitalize", styles.badge)}>{alert.severity}</Badge>
                            </TableCell>
                            <TableCell className="font-mono">{alert.assetId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {styles.icon}
                                <span>{alert.message}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{new Date(alert.timestamp).toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="anomaly" className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-muted/30">
            <AnomalyDetectionView />
          </TabsContent>

          <TabsContent value="reporting" className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-muted/30">
            <ReportingView />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
