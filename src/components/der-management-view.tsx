
"use client";

import { useState, useEffect } from "react";
import { PlaceholderView } from "./placeholder-view";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ControllableLoadManagementView } from "./controllable-load-management-view";
import type { DetailedCustomer } from "@/lib/types";
import { PlanDeveloperView } from "./plan-developer-view";

interface DERManagementViewProps {
    initialView?: string;
    onNavigate: (subView: string) => void;
    onSelectIcp: (icp: DetailedCustomer | null) => void;
}

export function DERManagementView({ initialView = "main", onNavigate, onSelectIcp }: DERManagementViewProps) {
    const [activeSubView, setActiveSubView] = useState(initialView);

    useEffect(() => {
        setActiveSubView(initialView);
    }, [initialView]);

    const handleBack = () => {
        setActiveSubView("main");
        onNavigate("main");
    };

    const handleCardClick = (subView: string) => {
        setActiveSubView(subView);
        onNavigate(subView);
    };

    const renderContent = () => {
        switch (activeSubView) {
            case "controllable-load":
                return <ControllableLoadManagementView onBack={handleBack} onSelectIcp={onSelectIcp} />;
            case "plan-developer":
                return <PlanDeveloperView onBack={handleBack} />;
            default:
                return (
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-4">DER Management</h1>
                        <p className="text-muted-foreground mb-8">
                            Tools and dashboards for managing Distributed Energy Resources.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card
                                className="group cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleCardClick("controllable-load")}
                            >
                                <CardHeader>
                                    <CardTitle>
                                        Controllable Load Management
                                    </CardTitle>
                                    <CardDescription>
                                        Monitor and manage controllable loads on the grid.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                            <Card
                                className="group cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleCardClick("plan-developer")}
                            >
                                <CardHeader>
                                    <CardTitle>
                                        Plan Developer
                                    </CardTitle>
                                    <CardDescription>
                                        Create and manage reusable load control plans.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            {/* Other DER dashboards can be added here */}
                        </div>
                    </div>
                );
        }
    };

    useEffect(() => {
        if (activeSubView === 'plan-developer') {
            onSelectIcp(null);
        }
    }, [activeSubView, onSelectIcp]);

    return <div className="h-full w-full">{renderContent()}</div>;
}
