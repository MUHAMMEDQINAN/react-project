
"use client";

import type { GridAsset, PointAsset, LinearAsset } from "@/lib/types";
import { isPointAsset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Zap, Building, Wind, Calendar, Thermometer, LinkIcon, AlertCircle, Info, Users, Link2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type AssetDetailProps = {
  asset: GridAsset | null;
  onClose: () => void;
};

const getStatusBadgeVariant = (status: GridAsset['status']) => {
  switch (status) {
    case 'Offline': return 'secondary';
    case 'Operational': return 'outline';
    case 'Warning': return 'outline';
    default: return 'outline';
  }
};

const getRiskColor = (score: number) => {
  if (score > 75) return "bg-destructive";
  if (score > 50) return "bg-accent";
  if (score > 25) return "bg-yellow-500";
  return "bg-green-500";
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
            {icon}
            <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{value}</span>
    </div>
);


export function AssetDetail({ asset, onClose }: AssetDetailProps) {
  if (!asset) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">Select an asset</h3>
            <p className="mt-1 text-sm text-muted-foreground">Click on an asset on the map to view its details.</p>
        </div>
    );
  }

  const isPoint = isPointAsset(asset);

  return (
    <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{asset.name}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                        <span>Status</span>
                        <Badge variant={getStatusBadgeVariant(asset.status)} className={cn("capitalize", 
                          asset.status === 'Warning' && 'border-yellow-500 text-yellow-500', 
                          asset.status === 'Operational' && 'border-green-500 text-green-500',
                          asset.status === 'Offline' && 'border-muted-foreground text-muted-foreground'
                        )}>
                          {asset.status}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <InfoRow icon={<Zap className="h-4 w-4" />} label="Type" value={asset.type} />
                        <InfoRow icon={<AlertCircle className="h-4 w-4" />} label="Risk Score" value={
                            <div className="flex items-center gap-2">
                                <span>{asset.riskScore}%</span>
                                <Progress value={asset.riskScore} className="w-20 h-2" indicatorClassName={getRiskColor(asset.riskScore)} />
                            </div>
                        } />
                        {asset.rationale && (
                           <div className="flex items-start gap-3 text-sm p-3 rounded-md bg-muted/50">
                               <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                               <p className="text-muted-foreground"><span className="font-semibold text-foreground">Rationale:</span> {asset.rationale}</p>
                           </div>
                        )}
                        <InfoRow icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={`${(asset as any).temperature}°C`} />
                         <InfoRow icon={<Zap className="h-4 w-4" />} label="Voltage" value={(asset as any).voltage} />
                        <InfoRow icon={<Building className="h-4 w-4" />} label="Capacity" value={(asset as any).capacity} />
                        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Next Maintenance" value={new Date(asset.maintenanceDate).toLocaleDateString()} />
                        {isPoint && (asset as PointAsset).customersServed && (
                           <InfoRow icon={<Users className="h-4 w-4" />} label="Customers Served" value={(asset as PointAsset).customersServed} />
                        )}
                         {!isPoint && (
                           <>
                            <InfoRow icon={<Link2 className="h-4 w-4" />} label="Starts At" value={(asset as LinearAsset).startAssetId} />
                             <InfoRow icon={<Link2 className="h-4 w-4" />} label="Ends At" value={(asset as LinearAsset).endAssetId} />
                           </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {isPoint && (asset as PointAsset).downstreamAssets && (asset as PointAsset).downstreamAssets!.length > 0 && (
              <Card>
                <CardHeader>
                    <CardTitle className="text-base">Downstream Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {(asset as PointAsset).downstreamAssets!.map(id => (
                            <div key={id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                <span className="font-mono">{id}</span>
                                <Button variant="ghost" size="sm">View</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>
            )}
        </div>
        <div className="p-4 mt-auto border-t">
            <Button className="w-full">Generate Asset Report</Button>
        </div>
    </div>
  );
}
