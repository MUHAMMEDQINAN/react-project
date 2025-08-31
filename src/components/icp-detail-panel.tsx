
"use client";

import type { DetailedCustomer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Info, Network, Tag, User, BarChart, Server, Map, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import dynamic from 'next/dynamic';
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import { getCustomerDetails } from "@/services/customer-service";
import { useAppMode } from "@/hooks/use-app-mode";
import { useToast } from "@/hooks/use-toast";

type IcpDetailPanelProps = {
  customer: DetailedCustomer;
  onClose: () => void;
};

const AttributeRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 px-3 text-sm even:bg-muted/50 rounded-md">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-right">{String(value ?? 'N/A')}</span>
    </div>
);

const MeteringComponentInfo = ({ data }: { data: DetailedCustomer['metering']['level3'] }) => (
    <div className="space-y-2">
        <AttributeRow label="Serial Number" value={data.serialNumber} />
        <AttributeRow label="Component Type" value={data.componentType} />
        <AttributeRow label="Meter Type" value={data.meterType} />
        <AttributeRow label="AMI Flag" value={data.amiFlag} />
        <AttributeRow label="Category" value={data.category} />
        <AttributeRow label="Compensation Factor" value={data.compensationFactor} />
        <AttributeRow label="Owner" value={data.owner} />
        <AttributeRow label="Removal Date" value={data.removalDate} />
    </div>
)

const MeteringChannelInfo = ({ data }: { data: DetailedCustomer['metering']['level4'] }) => (
    <div className="space-y-2">
        <AttributeRow label="Channel Number" value={data.channelNumber} />
        <AttributeRow label="Number of Dials" value={data.dials} />
        <AttributeRow label="Register Code" value={data.registerContentCode} />
        <AttributeRow label="Period of Availability" value={data.periodOfAvailability} />
        <AttributeRow label="Unit" value={data.unitOfMeasurement} />
        <AttributeRow label="Flow Direction" value={data.flowDirection} />
        <AttributeRow label="Accumulator Type" value={data.accumulatorType} />
        <AttributeRow label="Settlement Indicator" value={data.settlementIndicator} />
        <AttributeRow label="Event Reading" value={data.eventReading} />
    </div>
)

const LocationMap = dynamic(() => import('./location-map').then((mod) => mod.LocationMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[250px] w-full mt-4" />,
});

const PanelSkeleton = () => (
    <div className="p-4 space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2 pt-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-[250px] w-full mt-4" />
    </div>
)

export function IcpDetailPanel({ customer: icp, onClose }: IcpDetailPanelProps) {
  if (!icp) return null;

  return (
    <Card className="h-[40vh] flex flex-col border-t-2">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div>
            <CardTitle className="text-lg">ICP Details: {icp.icp.name}</CardTitle>
            <CardDescription className="font-mono">{icp.icp.id}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <Tabs defaultValue="icp" className="h-full flex flex-col">
            <TabsList className="px-4 border-b">
                <TabsTrigger value="icp"><Info className="mr-2 h-4 w-4" />ICP</TabsTrigger>
                <TabsTrigger value="network"><Network className="mr-2 h-4 w-4" />Network</TabsTrigger>
                <TabsTrigger value="pricing"><Tag className="mr-2 h-4 w-4" />Pricing</TabsTrigger>
                <TabsTrigger value="trader"><User className="mr-2 h-4 w-4" />Trader</TabsTrigger>
                <TabsTrigger value="metering"><BarChart className="mr-2 h-4 w-4" />Metering</TabsTrigger>
                <TabsTrigger value="derived"><Server className="mr-2 h-4 w-4" />Derived</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-1">
                <div className="p-4">
                    <TabsContent value="icp">
                        <div className="space-y-1">
                            <AttributeRow label="Status" value={icp.icp.status} />
                            <AttributeRow label="Status Reason" value={icp.icp.statusReason} />
                            <AttributeRow label="Address" value={`${icp.icp.address?.unit || ''} ${icp.icp.address?.propertyName || ''}, ${icp.icp.address?.number || ''} ${icp.icp.address?.street || ''}, ${icp.icp.address?.suburb || ''}`} />
                            <AttributeRow label="Town/Region" value={`${icp.icp.address?.town || ''}, ${icp.icp.address?.region || ''} ${icp.icp.address?.postCode || ''}`} />
                            <AttributeRow label="GPS" value={icp.icp.gps ? `Lat: ${icp.icp.gps.lat}, Lng: ${icp.icp.gps.lng}` : 'N/A'} />
                        </div>
                        <div className="mt-4 h-[250px] rounded-lg overflow-hidden border">
                           {icp.icp.gps && (
                               <LocationMap
                                  key={icp.icp.id}
                                  lat={icp.icp.gps.lat}
                                  lng={icp.icp.gps.lng}
                                  tooltipText={icp.icp.name}
                                />
                           )}
                        </div>
                    </TabsContent>
                    <TabsContent value="network">
                         {icp.network ? Object.entries(icp.network).map(([key, value]) => (
                             <AttributeRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={Array.isArray(value) ? value.join(', ') : value} />
                         )) : <p className="text-muted-foreground">No network data available.</p>}
                    </TabsContent>
                     <TabsContent value="pricing">
                         {icp.pricing ? Object.entries(icp.pricing).map(([key, value]) => (
                             <AttributeRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />
                         )) : <p className="text-muted-foreground">No pricing data available.</p>}
                    </TabsContent>
                    <TabsContent value="trader">
                        {icp.trader ? Object.entries(icp.trader).map(([key, value]) => (
                             <AttributeRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />
                         )) : <p className="text-muted-foreground">No trader data available.</p>}
                    </TabsContent>
                    <TabsContent value="metering">
                         {icp.metering ? (
                            <>
                                <Card>
                                    <CardHeader>
                                    <CardTitle className="text-md">Metering Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {icp.metering.level1 && Object.entries(icp.metering.level1).map(([key, value]) => (
                                            <AttributeRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />
                                        ))}
                                    </CardContent>
                                </Card>
                                <Accordion type="single" collapsible className="w-full mt-4">
                                    {icp.metering.level2 && (
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger>Level 2: Metering Installation Information</AccordionTrigger>
                                            <AccordionContent>
                                                {Object.entries(icp.metering.level2).map(([key, value]) => (
                                                    <AttributeRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}
                                    {icp.metering.level3 && (
                                        <AccordionItem value="item-2">
                                            <AccordionTrigger>Level 3: Metering Component Information</AccordionTrigger>
                                            <AccordionContent>
                                                <MeteringComponentInfo data={icp.metering.level3} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}
                                    {icp.metering.level4 && (
                                        <AccordionItem value="item-3">
                                            <AccordionTrigger>Level 4: Metering Channel Information</AccordionTrigger>
                                            <AccordionContent>
                                                <MeteringChannelInfo data={icp.metering.level4} />
                                            </AccordionContent>
                                        </AccordionItem>
                                    )}
                                </Accordion>
                            </>
                         ) : <p className="text-muted-foreground">No metering data available.</p>}
                    </TabsContent>
                    <TabsContent value="derived">
                        {icp.derived ? Object.entries(icp.derived).map(([key, value]) => (
                             <AttributeRow key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} value={value} />
                         )) : <p className="text-muted-foreground">No derived data available.</p>}
                    </TabsContent>
                </div>
            </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
    

    