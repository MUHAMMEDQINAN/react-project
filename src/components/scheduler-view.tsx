

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, PlusCircle, Search, Calendar, Edit, Trash2, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import React, { useState, useMemo, useEffect } from "react";
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


export function SchedulerView({ onSelectIcp }: { onSelectIcp: (customer: DetailedCustomer | null) => void }) {
    const [allCustomers, setAllCustomers] = useState<CustomerSummary[]>([]);
    const [detailedCustomersCache, setDetailedCustomersCache] = useState<Record<string, DetailedCustomer>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());
    const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
    
    const [viewMode, setViewMode] = useState<'view' | 'edit' | 'create'>('view');
    const [scheduleToEdit, setScheduleToEdit] = useState<DerSchedule | null>(null);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);


    const { toast } = useToast();
    const { mode } = useAppMode();
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const data = await getCustomerSummaries(mode);
                setAllCustomers(data);
            } catch (err) {
                 setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [mode]);

    useEffect(() => {
        if (viewMode === 'create' || viewMode === 'edit') {
            onSelectIcp(null);
        }
    }, [viewMode, onSelectIcp]);


    const filteredCustomers = useMemo(() => {
        if (!allCustomers) return [];
        return allCustomers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allCustomers]);

    const customersForCreator = useMemo(() => {
        // This will only return customers that are fully loaded in the cache
        return Array.from(selectedCustomerIds)
            .map(id => detailedCustomersCache[id])
            .filter(Boolean) as DetailedCustomer[];
    }, [selectedCustomerIds, detailedCustomersCache]);

    const activeCustomer = useMemo(() => {
        if (!activeCustomerId) return null;
        return detailedCustomersCache[activeCustomerId] || null;
    }, [activeCustomerId, detailedCustomersCache]);

    const handleCustomerSelect = (customerId: string) => {
        const newSelectedIds = new Set(selectedCustomerIds);
        if (newSelectedIds.has(customerId)) {
            newSelectedIds.delete(customerId);
        } else {
            newSelectedIds.add(customerId);
        }
        setSelectedCustomerIds(newSelectedIds);

        if (newSelectedIds.size === 0) {
            setIsMultiSelectMode(false);
        }
    };
    
    const handleRowClick = async (customerId: string, isMultiSelect: boolean) => {
        onSelectIcp(null);

        if (isMultiSelect) {
            if (!isMultiSelectMode) {
                setIsMultiSelectMode(true);
            }
            handleCustomerSelect(customerId);
            setActiveCustomerId(customerId); 
        } else if (isMultiSelectMode) {
            setActiveCustomerId(customerId);
            setViewMode('view');
        } else {
            setIsMultiSelectMode(false);
            if (viewMode !== 'view') {
                setViewMode('view');
            }
            setActiveCustomerId(customerId);
            setSelectedCustomerIds(new Set());
        }
        
        if (!detailedCustomersCache[customerId]) {
            setIsDetailLoading(true);
            try {
                const details = await getCustomerDetails(customerId, mode);
                setDetailedCustomersCache(prev => ({ ...prev, [customerId]: details }));
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

    const handleInfoClick = async (e: React.MouseEvent, customerId: string) => {
        e.stopPropagation();
        
        // Set the active customer for the scheduler view
        setActiveCustomerId(customerId);
        // Ensure we are in single-selection mode
        setIsMultiSelectMode(false);
        setSelectedCustomerIds(new Set());
        setViewMode('view');


        if (!detailedCustomersCache[customerId]) {
            setIsDetailLoading(true);
            try {
                const details = await getCustomerDetails(customerId, mode);
                setDetailedCustomersCache(prev => ({...prev, [customerId]: details}));
                onSelectIcp(details); // Open bottom panel
            } catch (err) {
                 toast({ variant: 'destructive', title: "Failed to load ICP details." });
                 onSelectIcp(null);
            } finally {
                setIsDetailLoading(false);
            }
        } else {
            onSelectIcp(detailedCustomersCache[customerId]); // Open bottom panel
        }
    };
    
    const handleSaveSchedule = async (schedule: DerSchedule) => {
        const targetIds = Array.from(selectedCustomerIds);
        if (targetIds.length === 0) return;

        try {
            await saveCustomerSchedule(targetIds, schedule, mode);
            
            // --- This is optimistic UI update. In a real app, you might re-fetch. ---
            const updatedCache = { ...detailedCustomersCache };
            const updatedSummaries = allCustomers.map(summary => {
                if(selectedCustomerIds.has(summary.id)) {
                    if (updatedCache[summary.id]) {
                        const existingSchedules = updatedCache[summary.id].schedules || [];
                        const scheduleIndex = existingSchedules.findIndex(s => s.derType === schedule.derType);
                        if (scheduleIndex > -1) {
                            existingSchedules[scheduleIndex] = schedule;
                        } else {
                            existingSchedules.push(schedule);
                        }
                        updatedCache[summary.id].schedules = existingSchedules;
                    }
                    const newScheduledDerTypes = new Set(summary.scheduledDerTypes || []);
                    newScheduledDerTypes.add(schedule.derType);

                    return { ...summary, hasSchedule: true, scheduledDerTypes: Array.from(newScheduledDerTypes) };
                }
                return summary;
            });

            setDetailedCustomersCache(updatedCache);
            setAllCustomers(updatedSummaries);
            // --- End of optimistic update ---

            toast({
                title: "Schedule Saved",
                description: `The schedule has been updated for ${selectedCustomerIds.size} customer(s).`,
            });
            
            onSelectIcp(null);
            setViewMode('view');
            setIsMultiSelectMode(false);
            setScheduleToEdit(null);
            if (selectedCustomerIds.size === 1) {
                setActiveCustomerId(Array.from(selectedCustomerIds)[0]);
            } else {
                setSelectedCustomerIds(new Set());
                setActiveCustomerId(null);
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
        if (!activeCustomerId) return;
        
        try {
            await deleteCustomerSchedule(activeCustomerId, derType, mode);

            // --- Optimistic UI update ---
            const updatedCache = { ...detailedCustomersCache };
            const customer = updatedCache[activeCustomerId];
            if (customer && customer.schedules) {
                customer.schedules = customer.schedules.filter(s => s.derType !== derType);
                updatedCache[activeCustomerId] = customer;

                const updatedSummaries = allCustomers.map(summary => {
                    if (summary.id === activeCustomerId) {
                        const newScheduledDerTypes = summary.scheduledDerTypes?.filter(d => d !== derType);
                        return { ...summary, hasSchedule: (customer.schedules?.length ?? 0) > 0, scheduledDerTypes: newScheduledDerTypes };
                    }
                    return summary;
                });
                setAllCustomers(updatedSummaries);
                setDetailedCustomersCache(updatedCache);
                toast({ title: `Schedule for ${derType} removed.`});
            }
            // --- End of optimistic update ---
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

        let targetIds: Set<string>;
        if (activeCustomerId && !isMultiSelectMode) {
            targetIds = new Set([activeCustomerId]);
        } else {
            targetIds = new Set(selectedCustomerIds);
        }

        if (targetIds.size === 0 && activeCustomerId) {
             targetIds = new Set([activeCustomerId]);
        }

        if (targetIds.size === 0) {
            toast({
                variant: "destructive",
                title: "No Customer Selected",
                description: "Please select one or more customers to create a schedule.",
            });
            return;
        }

        const idsToFetch = Array.from(targetIds).filter(id => !detailedCustomersCache[id]);
        if (idsToFetch.length > 0) {
            // Fetch details for any customer not in cache
        }
        
        setSelectedCustomerIds(targetIds);
        setViewMode('create');
    };

    const handleEditSchedule = (schedule: DerSchedule) => {
        onSelectIcp(null);
        setSelectedCustomerIds(new Set([activeCustomerId!]));
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
        
        if (isMultiSelectMode && selectedCustomerIds.size > 1) {
             return (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <div>
                        <h3 className="text-lg font-semibold">Multiple ICPs Selected</h3>
                        <p className="text-muted-foreground mb-4">{selectedCustomerIds.size} customers selected.</p>
                        <Button onClick={handleCreateNew}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Schedule for {selectedCustomerIds.size} ICPs
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
                                    <Card key={schedule.derType} className="mb-1">
                                        <CardHeader className="flex flex-row justify-between items-center p-3">
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
                    {[...Array(10)].map((_, i) => (
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
                    const isSelected = selectedCustomerIds.has(customer.id);
                    const isActive = activeCustomerId === customer.id;
                    return (
                    <div
                        key={customer.id}
                        className={cn(
                            "flex items-stretch border-b hover:bg-muted/50 cursor-pointer group",
                            isActive && !isMultiSelectMode && 'bg-muted'
                        )}
                        onClick={(e) => handleRowClick(customer.id, e.ctrlKey || e.metaKey)}
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
                                <Checkbox checked={isSelected} onCheckedChange={() => handleCustomerSelect(customer.id)} />
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
                                        onClick={(e) => handleRowClick(customer.id, false)}
                                    >
                                        <Calendar className="h-4 w-4 text-primary" />
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8"
                                    onClick={(e) => handleInfoClick(e, customer.id)}
                                >
                                    <Info className="h-4 w-4 text-primary" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )})}
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
                    <ScrollArea className="flex-1">
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

