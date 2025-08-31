

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, Search, Calendar, Edit, Trash2, Info, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { DetailedCustomer, DerSchedule, CustomerSummary, DerType } from "@/lib/types";
import { getCustomerSummaries, getCustomerDetails, saveCustomerSchedule, deleteCustomerSchedule } from "@/services/customer-service";
import { useToast } from "@/hooks/use-toast";
import { useAppMode } from "@/hooks/use-app-mode";
import { ScheduleCreator } from "./schedule-creator";
import { Skeleton } from "./ui/skeleton";
import { ScheduleViewer } from "./schedule-viewer";
import { motion, AnimatePresence } from 'framer-motion';
import { DerTypeIcon } from "./der-type-icon";
import { Badge } from "./ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

const PAGE_SIZE = 100;

export function SchedulerView({ onSelectIcp }: { onSelectIcp: (customer: DetailedCustomer | null) => void }) {
    const [allCustomers, setAllCustomers] = useState<CustomerSummary[]>([]);
    const [detailedCustomersCache, setDetailedCustomersCache] = useState<Record<string, DetailedCustomer>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [selectedCustomerUuids, setSelectedCustomerUuids] = useState<Set<string>>(new Set());
    const [activeCustomerUuid, setActiveCustomerUuid] = useState<string | null>(null);
    
    const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('view');
    const [scheduleToEdit, setScheduleToEdit] = useState<DerSchedule | null>(null);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);


    const { toast } = useToast();
    const { mode } = useAppMode();
    const [searchTerm, setSearchTerm] = useState("");

    const loadCustomers = useCallback(async (currentOffset: number, isInitialLoad: boolean) => {
        if (isFetchingMore || !hasMore) return;
        
        if (isInitialLoad) {
            setIsLoading(true);
        } else {
            setIsFetchingMore(true);
        }
        
        try {
            const { summaries, totalCount } = await getCustomerSummaries(mode, PAGE_SIZE, currentOffset);
            setAllCustomers(prev => currentOffset === 0 ? summaries : [...prev, ...summaries]);
            setHasMore( (currentOffset + summaries.length) < totalCount );
            setOffset(currentOffset + summaries.length);
        } catch (err) {
             setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    }, [mode, isFetchingMore, hasMore]);

    useEffect(() => {
        // Reset state when mode changes to ensure we don't show stale data
        setAllCustomers([]);
        setOffset(0);
        setHasMore(true);
        loadCustomers(0, true);
    }, [mode]);

    useEffect(() => {
        if (viewMode === 'create' || viewMode === 'edit') {
            onSelectIcp(null);
        }
    }, [viewMode, onSelectIcp]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) { // Load when 1.5 viewport heights away from the bottom
            if (!isFetchingMore && hasMore) {
                loadCustomers(offset, false);
            }
        }
    };


    const filteredCustomers = useMemo(() => {
        if (!allCustomers) return [];
        if (searchTerm.length > 0) {
            return allCustomers.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return allCustomers;
    }, [searchTerm, allCustomers]);

    const customersForCreator = useMemo(() => {
        // This will only return customers that are fully loaded in the cache
        return Array.from(selectedCustomerUuids)
            .map(uuid => detailedCustomersCache[uuid])
            .filter(Boolean) as DetailedCustomer[];
    }, [selectedCustomerUuids, detailedCustomersCache]);

    const activeCustomer = useMemo(() => {
        if (!activeCustomerUuid) return null;
        return detailedCustomersCache[activeCustomerUuid] || null;
    }, [activeCustomerUuid, detailedCustomersCache]);

    const handleCustomerSelect = (customerUuid: string) => {
        const newSelectedUuids = new Set(selectedCustomerUuids);
        if (newSelectedUuids.has(customerUuid)) {
            newSelectedUuids.delete(customerUuid);
        } else {
            newSelectedUuids.add(customerUuid);
        }
        setSelectedCustomerUuids(newSelectedUuids);

        if (newSelectedUuids.size === 0) {
            setIsMultiSelectMode(false);
        }
    };
    
    const handleRowClick = async (customerUuid: string, isMultiSelect: boolean) => {
        onSelectIcp(null);

        if (isMultiSelect) {
            if (!isMultiSelectMode) {
                setIsMultiSelectMode(true);
            }
            handleCustomerSelect(customerUuid);
            setActiveCustomerUuid(customerUuid); 
        } else if (isMultiSelectMode) {
            setActiveCustomerUuid(customerUuid);
            setViewMode('view');
        } else {
            setIsMultiSelectMode(false);
            if (viewMode !== 'view') {
                setViewMode('view');
            }
            setActiveCustomerUuid(customerUuid);
            setSelectedCustomerUuids(new Set());
        }
        
        if (!detailedCustomersCache[customerUuid]) {
            setIsDetailLoading(true);
            try {
                const details = await getCustomerDetails(customerUuid, mode);
                setDetailedCustomersCache(prev => ({ ...prev, [customerUuid]: details }));
            } catch (err) {
                toast({
                    variant: 'destructive',
                    title: "Failed to load customer details.",
                    description: err instanceof Error ? err.message : String(err)
                });
            } finally {
                setIsDetailLoading(false);
            }
        }
    };

    const handleInfoClick = async (e: React.MouseEvent, customerUuid: string) => {
        e.stopPropagation();
        
        setActiveCustomerUuid(customerUuid);
        setIsMultiSelectMode(false);
        setSelectedCustomerUuids(new Set());
        setViewMode('view');

        if (!detailedCustomersCache[customerUuid]) {
            setIsDetailLoading(true);
            try {
                const details = await getCustomerDetails(customerUuid, mode);
                setDetailedCustomersCache(prev => ({...prev, [customerUuid]: details}));
                onSelectIcp(details);
            } catch (err) {
                 toast({ variant: 'destructive', title: "Failed to load ICP details." });
                 onSelectIcp(null);
            } finally {
                setIsDetailLoading(false);
            }
        } else {
            onSelectIcp(detailedCustomersCache[customerUuid]);
        }
    };
    
    const handleSaveSchedule = async (schedule: DerSchedule) => {
        onSelectIcp(null);
        let targetUuids = Array.from(selectedCustomerUuids);
        if (targetUuids.length === 0 && activeCustomerUuid) {
            targetUuids = [activeCustomerUuid];
        }

        if (targetUuids.length === 0) return;

        try {
            await saveCustomerSchedule(targetUuids, schedule, mode);
            
            const updatedCache = { ...detailedCustomersCache };
            const updatedSummaries = allCustomers.map(summary => {
                if(targetUuids.includes(summary.uuid)) {
                    if (updatedCache[summary.uuid]) {
                        const existingSchedules = updatedCache[summary.uuid].schedules || [];
                        const scheduleIndex = existingSchedules.findIndex(s => s.derType === schedule.derType);
                        if (scheduleIndex > -1) {
                            existingSchedules[scheduleIndex] = schedule;
                        } else {
                            existingSchedules.push(schedule);
                        }
                        updatedCache[summary.uuid].schedules = existingSchedules;
                    }
                    const newScheduledDerTypes = new Set(summary.scheduledDerTypes || []);
                    newScheduledDerTypes.add(schedule.derType);

                    return { ...summary, hasSchedule: true, scheduledDerTypes: Array.from(newScheduledDerTypes) };
                }
                return summary;
            });

            setDetailedCustomersCache(updatedCache);
            setAllCustomers(updatedSummaries);

            toast({
                title: "Schedule Saved",
                description: `The schedule has been updated for ${targetUuids.length} customer(s).`,
            });
            
            
            setViewMode('view');
            setIsMultiSelectMode(false);
            setScheduleToEdit(null);
            if (targetUuids.length === 1) {
                setActiveCustomerUuid(targetUuids[0]);
            } else {
                setSelectedCustomerUuids(new Set());
                setActiveCustomerUuid(null);
            }
        } catch (err) {
            toast({
                variant: 'destructive',
                title: "Failed to save schedule.",
                description: err instanceof Error ? err.message : String(err)
            });
        }
    };

    const handleDeleteSchedule = async (derType: DerType) => {
        if (!activeCustomerUuid) return;
        
        try {
            await deleteCustomerSchedule(activeCustomerUuid, derType, mode);

            const updatedCache = { ...detailedCustomersCache };
            const customer = updatedCache[activeCustomerUuid];
            if (customer && customer.schedules) {
                customer.schedules = customer.schedules.filter(s => s.derType !== derType);
                updatedCache[activeCustomerUuid] = customer;

                const updatedSummaries = allCustomers.map(summary => {
                    if (summary.uuid === activeCustomerUuid) {
                        const newScheduledDerTypes = summary.scheduledDerTypes?.filter(d => d !== derType);
                        return { ...summary, hasSchedule: (customer.schedules?.length ?? 0) > 0, scheduledDerTypes: newScheduledDerTypes };
                    }
                    return summary;
                });
                setAllCustomers(updatedSummaries);
                setDetailedCustomersCache(updatedCache);
                toast({ title: `Schedule for ${derType} removed.`});
            }
        } catch (err) {
             toast({
                variant: 'destructive',
                title: "Failed to delete schedule.",
                description: err instanceof Error ? err.message : String(err)
            });
        }
    }
    
    const handleCreateNew = async () => {
        onSelectIcp(null);
        setScheduleToEdit(null);

        let targetUuids: Set<string>;
        if (activeCustomerUuid && !isMultiSelectMode) {
            targetUuids = new Set([activeCustomerUuid]);
        } else {
            targetUuids = new Set(selectedCustomerUuids);
        }

        if (targetUuids.size === 0 && activeCustomerUuid) {
             targetUuids = new Set([activeCustomerUuid]);
        }

        if (targetUuids.size === 0) {
            toast({
                variant: "destructive",
                title: "No Customer Selected",
                description: "Please select one or more customers to create a schedule.",
            });
            return;
        }

        const uuidsToFetch = Array.from(targetUuids).filter(uuid => !detailedCustomersCache[uuid]);
        if (uuidsToFetch.length > 0) {
            // Fetch details for any customer not in cache
        }
        
        setSelectedCustomerUuids(targetUuids);
        setViewMode('create');
    };

    const handleEditSchedule = (schedule: DerSchedule) => {
        onSelectIcp(null);
        setSelectedCustomerUuids(new Set([activeCustomerUuid!]));
        setScheduleToEdit(schedule);
        setViewMode('edit');
    };

    const renderRightPanel = () => {
        if (viewMode === 'create' || viewMode === 'edit') {
            return (
                <div className="h-full">
                    <ScheduleCreator 
                        customers={customersForCreator}
                        scheduleToEdit={scheduleToEdit}
                        onCancel={() => { 
                            setViewMode('view');
                            setScheduleToEdit(null);
                        }}
                        onSave={handleSaveSchedule}
                    />
                </div>
            )
        }
        
        if (isMultiSelectMode && selectedCustomerUuids.size > 1) {
             return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div>
                        <h3 className="text-lg font-semibold">Multiple ICPs Selected</h3>
                        <p className="text-muted-foreground mb-4">{selectedCustomerUuids.size} customers selected.</p>
                        <Button onClick={handleCreateNew}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Schedule for {selectedCustomerUuids.size} ICPs
                        </Button>
                    </div>
                </div>
            )
        }

        if (isDetailLoading && !activeCustomer) {
            return <div className="p-4 space-y-4"><Skeleton className="h-full w-full" /></div>
        }

        if (!activeCustomer) {
            return (
                <div className="flex-1 flex items-center justify-center text-center p-4">
                    <div>
                        <p className="text-muted-foreground">Select a customer to view their schedule.</p>
                        <p className="text-xs text-muted-foreground mt-2">(Use Ctrl/Cmd + Click to select multiple customers)</p>
                    </div>
                </div>
            )
        }

        return (
             <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">{activeCustomer.icp.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{activeCustomer.icp.id}</p>
                    </div>
                    <Button onClick={handleCreateNew}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Schedule
                    </Button>
                </div>
                <div className="flex-1 overflow-auto">
                    {activeCustomer.schedules && activeCustomer.schedules.length > 0 ? (
                        <div>
                             <div className="p-2 space-y-1">
                                {activeCustomer.schedules.map(schedule => (
                                    <Card key={schedule.derType} className="mb-1 p-0">
                                        <CardHeader className="flex flex-row justify-between items-center p-1 px-3">
                                            <div className="flex items-center gap-2">
                                                <DerTypeIcon type={schedule.derType} className="h-5 w-5" />
                                                <CardTitle className="text-base">{schedule.derType} Schedule</CardTitle>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEditSchedule(schedule)}><Edit className="h-4 w-4" /></Button>
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action will permanently delete the schedule for {schedule.derType}.
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteSchedule(schedule.derType)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                            <ScheduleViewer schedules={activeCustomer.schedules} />
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted-foreground">No schedules defined for this customer.</div>
                    )}
                </div>
            </div>
        )
    };


    const renderCustomerList = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col p-2">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-3 border-b">
                            <Skeleton className="h-4 w-6 mr-2" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return (
            <div className="flex flex-col">
                {filteredCustomers.map(customer => {
                    const isSelected = selectedCustomerUuids.has(customer.uuid);
                    const isActive = activeCustomerUuid === customer.uuid;
                    return (
                    <div
                        key={customer.uuid}
                        className={cn(
                            "flex items-stretch border-b hover:bg-muted/50 cursor-pointer group",
                            isActive && !isMultiSelectMode && 'bg-muted'
                        )}
                        onClick={(e) => handleRowClick(customer.uuid, e.ctrlKey || e.metaKey)}
                    >
                        <AnimatePresence>
                        {isMultiSelectMode && (
                           <motion.div 
                             initial={{ width: 0, opacity: 0 }}
                             animate={{ width: 'auto', opacity: 1 }}
                             exit={{ width: 0, opacity: 0 }}
                             transition={{ duration: 0.3, ease: "easeInOut" }}
                             className="flex items-center overflow-hidden"
                           >
                              <div className="px-4">
                                <Checkbox checked={isSelected} onCheckedChange={() => handleCustomerSelect(customer.uuid)} />
                              </div>
                           </motion.div>
                        )}
                        </AnimatePresence>
                        <div className="flex-1 p-3 flex justify-between items-center">
                            <div>
                               <p className="font-semibold">{customer.name}</p>
                               <div className="flex items-center gap-2 pt-1">
                                  <p className="text-sm text-muted-foreground font-mono">{customer.id}</p>
                                  {(customer.scheduledDerTypes || []).map(derType => (
                                      <DerTypeIcon key={derType} type={derType} className="h-4 w-4 text-muted-foreground" />
                                  ))}
                               </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {customer.hasSchedule && (
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(customer.uuid, false);
                                        }}
                                    >
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => handleInfoClick(e, customer.uuid)}
                                >
                                    <Info className="h-4 w-4 text-primary" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )})}
                 {isFetchingMore && (
                    <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading more...</span>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>Load Control Scheduler</CardTitle>
                    <CardDescription>Manage customer (ICP) load control timetables.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                <div className="md:col-span-1 flex flex-col border rounded-lg">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Customers (ICPs)</h3>
                        <div className="relative mt-2">
                           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Search by ICP or name..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </div>
                    <ScrollArea className="flex-1" onScroll={handleScroll}>
                        {renderCustomerList()}
                    </ScrollArea>
                </div>

                <div className="md:col-span-2 flex flex-col border rounded-lg overflow-hidden">
                    {renderRightPanel()}
                </div>
            </CardContent>
        </Card>
    )
}
