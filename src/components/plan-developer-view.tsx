

"use client"

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ControlPlan } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PlanCreator } from "./plan-creator";
import { ScheduleViewer } from "./schedule-viewer";
import { ArrowLeft, PlusCircle, Edit, Trash2 } from "lucide-react";
import { DerTypeIcon } from "./der-type-icon";
import { Badge } from "./ui/badge";
import { useAppMode } from "@/hooks/use-app-mode";
import { getControlPlans, saveControlPlan, deleteControlPlan } from "@/services/plan-service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";

interface PlanDeveloperViewProps {
    onBack: () => void;
}

export function PlanDeveloperView({ onBack }: PlanDeveloperViewProps) {
    const [allPlans, setAllPlans] = useState<ControlPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<ControlPlan | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const { toast } = useToast();
    const { mode } = useAppMode();

    useEffect(() => {
        async function loadPlans() {
            setIsLoading(true);
            try {
                const plans = await getControlPlans(mode);
                setAllPlans(plans);
            } catch (err) {
                toast({ variant: "destructive", title: "Failed to load plans." });
            } finally {
                setIsLoading(false);
            }
        }
        loadPlans();
    }, [mode, toast]);

    const handleCreateNew = () => {
        setSelectedPlan(null);
        setIsEditing(true);
    };

    const handleEdit = (plan: ControlPlan) => {
        setSelectedPlan(plan);
        setIsEditing(true);
    };
    
    const handleDelete = async (planId: string) => {
        try {
            await deleteControlPlan(planId, mode);
            setAllPlans(prev => prev.filter(p => p.id !== planId));
            setSelectedPlan(null);
            setIsEditing(false);
            toast({ title: "Plan Deleted" });
        } catch (err) {
            toast({ variant: "destructive", title: "Failed to delete plan." });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    }

    const handleSave = async (planToSave: ControlPlan) => {
        try {
            const savedPlan = await saveControlPlan(planToSave, mode);
            const isNew = !planToSave.id;

            if (isNew) {
                setAllPlans(prev => [...prev, savedPlan]);
            } else {
                setAllPlans(prev => prev.map(p => p.id === savedPlan.id ? savedPlan : p));
            }

            setSelectedPlan(savedPlan);
            setIsEditing(false);

            toast({
                title: isNew ? "Plan Created" : "Plan Updated",
                description: `The plan "${savedPlan.name}" has been saved.`,
            });
        } catch (err) {
             toast({
                variant: "destructive",
                title: "Failed to save plan",
                description: err instanceof Error ? err.message : String(err),
            });
        }
    };

    const renderPlanList = () => {
        if (isLoading) {
            return <div className="text-center p-4 text-sm text-muted-foreground">Loading plans...</div>
        }
        if (allPlans.length === 0) {
            return <div className="text-center p-4 text-sm text-muted-foreground">No control plans found.</div>
        }
        return (
            <div className="flex flex-col">
                {allPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={cn(
                            "flex items-stretch border-b hover:bg-muted/50 cursor-pointer group",
                            selectedPlan?.id === plan.id && !isEditing && 'bg-muted'
                        )}
                        onClick={() => { setSelectedPlan(plan); setIsEditing(false); }}
                    >
                        <div className="flex-1 p-3 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{plan.name}</p>
                                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                                    <DerTypeIcon type={plan.derType} className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    };

    const renderDetailPanel = () => {
        if(isEditing) {
            return <PlanCreator plan={selectedPlan} onCancel={handleCancel} onSave={handleSave} />
        }

        if(!selectedPlan) {
            return (
                <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                        <p className="text-muted-foreground mb-4">Select a plan to view its details or create a new one.</p>
                        <Button onClick={handleCreateNew}><PlusCircle className="mr-2 h-4 w-4" />Create New Plan</Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                        <div className="flex flex-wrap gap-1 pt-1">
                           <Badge variant="secondary" className="gap-1">
                             <DerTypeIcon type={selectedPlan.derType} className="h-3 w-3" />
                             {selectedPlan.derType}
                           </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleEdit(selectedPlan)}><Edit className="mr-2 h-4 w-4" />Edit Plan</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button></AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the control plan.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(selectedPlan.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                    {selectedPlan.schedule ? (
                        <div className="mt-4 border rounded-lg overflow-hidden h-[500px]">
                           <ScheduleViewer schedules={[selectedPlan]} />
                        </div>
                    ) : (
                        <div className="p-4 text-muted-foreground">No schedule defined for this plan.</div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <Card className="flex-1 flex flex-col min-h-0">
             <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle>Plan Developer</CardTitle><CardDescription>Create and manage reusable load control plans.</CardDescription></div>
                 <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back to DER Home</Button>
            </CardHeader>
            <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                <div className="md:col-span-1 flex flex-col border rounded-lg">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-semibold">Control Plans</h3>
                        <Button size="sm" variant="outline" onClick={handleCreateNew}><PlusCircle className="mr-2 h-4 w-4" /> New</Button>
                    </div>
                    <ScrollArea className="flex-1">{renderPlanList()}</ScrollArea>
                </div>
                <div className="md:col-span-2 flex flex-col border rounded-lg overflow-hidden">{renderDetailPanel()}</div>
            </CardContent>
        </Card>
    )
}

    