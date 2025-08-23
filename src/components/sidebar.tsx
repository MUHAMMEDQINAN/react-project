
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Lock, Unlock, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/context/AuthContext";

export type NavItem = {
    id: string;
    label: string;
    icon: React.ElementType;
    subItems?: NavItem[];
};

interface SidebarProps {
    navItems: NavItem[];
    activeView: string;
    setActiveView: (view: string) => void;
}

function NavItemButton({ item, activeView, setActiveView, isPinned, isParentHovered }: { item: NavItem, activeView: string, setActiveView: (view: string) => void, isPinned: boolean, isParentHovered: boolean}) {
    const isActive = activeView.startsWith(item.id);
    
    const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(isActive);

    React.useEffect(() => {
        if (isPinned) {
            // If pinned, submenu state is sticky, based on active route
            setIsSubMenuOpen(isActive);
        } else {
             // If not pinned, collapse when not hovered
            if (!isParentHovered) {
                setIsSubMenuOpen(false);
            } else {
                // When hovering, it can be open if active
                setIsSubMenuOpen(isActive);
            }
        }
    }, [isActive, isPinned, isParentHovered]);
    
    const handleMainClick = () => {
        if (item.subItems && item.subItems.length > 0) {
            const isCurrentlyOpen = isSubMenuOpen;
            const newOpenState = !isCurrentlyOpen;
            
            // Only toggle if pinned or currently hovered
            if (isPinned || isParentHovered) {
                setIsSubMenuOpen(newOpenState);
            }
            
            setActiveView(item.id);
        } else {
            setActiveView(item.id);
        }
    };
    
    if (item.subItems && item.subItems.length > 0) {
        return (
            <Collapsible open={isSubMenuOpen} onOpenChange={setIsSubMenuOpen} className="w-full">
                 <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "rounded-lg justify-between h-10 w-full",
                                    isActive && "bg-muted text-foreground"
                                )}
                                onClick={handleMainClick}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    <span className={cn(
                                        "truncate transition-opacity duration-300",
                                        isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isSubMenuOpen && "rotate-180", isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                            </Button>
                        </CollapsibleTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5} className={cn(isPinned ? "hidden" : "group-hover:hidden")}>
                        {item.label}
                    </TooltipContent>
                </Tooltip>
                <AnimatePresence>
                {(isSubMenuOpen && (isPinned || isParentHovered)) && (
                    <CollapsibleContent asChild forceMount>
                        <motion.div
                           initial={{ height: 0, opacity: 0 }}
                           animate={{ height: "auto", opacity: 1 }}
                           exit={{ height: 0, opacity: 0 }}
                           transition={{ duration: 0.2, ease: "easeInOut" }}
                           className={cn("pl-7 pt-1 flex flex-col gap-1 overflow-hidden", isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
                        >
                            {item.subItems.map(subItem => (
                                <Button
                                    key={subItem.id}
                                    variant={activeView === subItem.id ? "secondary" : "ghost"}
                                    size="sm"
                                    className="justify-start"
                                    onClick={() => setActiveView(subItem.id)}
                                >
                                    <subItem.icon className="mr-2 h-4 w-4" />
                                    {subItem.label}
                                </Button>
                            ))}
                        </motion.div>
                    </CollapsibleContent>
                )}
                </AnimatePresence>
            </Collapsible>
        )
    }

    return (
        <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Button
                    variant={activeView === item.id ? "secondary" : "ghost"}
                    className={cn(
                        "rounded-lg justify-start h-10 w-full",
                        activeView === item.id && "bg-muted text-foreground"
                    )}
                    onClick={() => setActiveView(item.id)}
                >
                    <item.icon className="h-5 w-5 mr-3 shrink-0" />
                    <span className={cn(
                        "truncate transition-opacity duration-300",
                        isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                        {item.label}
                    </span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={5} className={cn(isPinned ? "hidden" : "group-hover:hidden")}>
                {item.label}
            </TooltipContent>
        </Tooltip>
    );
}

export function Sidebar({ navItems, activeView, setActiveView }: SidebarProps) {
    const [isPinned, setIsPinned] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    const handlePinClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPinned(!isPinned);
    }
    
    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <TooltipProvider>
            <aside 
              className={cn(
                "group hidden md:flex flex-col gap-4 border-r bg-background p-2 transition-all duration-500 ease-in-out",
                isPinned ? "w-60" : "w-16 hover:w-60"
              )}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
                
                <motion.nav layout className="flex flex-col gap-1 pt-4">
                    {navItems.map((item) => (
                        <motion.div layout="position" key={item.id} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                           <NavItemButton 
                             item={item}
                             activeView={activeView}
                             setActiveView={setActiveView}
                             isPinned={isPinned}
                             isParentHovered={isHovered}
                           />
                        </motion.div>
                    ))}
                </motion.nav>
                <div className="mt-auto flex flex-col gap-1">
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                             <Button
                                variant="ghost"
                                className="rounded-lg justify-start h-10"
                                onClick={handlePinClick}
                            >
                                {isPinned ? <Unlock className="h-5 w-5 mr-3 shrink-0" /> : <Lock className="h-5 w-5 mr-3 shrink-0" />}
                                <span className={cn(
                                    "truncate transition-opacity duration-300",
                                    isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    {isPinned ? "Unlock" : "Lock"} Sidebar
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className={cn(
                                isPinned ? "hidden" : "group-hover:hidden"
                            )}>
                               {isPinned ? "Unlock" : "Lock"} Sidebar
                        </TooltipContent>
                    </Tooltip>
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                             <Button
                                variant="ghost"
                                className="rounded-lg justify-start h-10"
                            >
                                <Settings className="h-5 w-5 mr-3 shrink-0" />
                                <span className={cn(
                                    "truncate transition-opacity duration-300",
                                    isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    Settings
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className={cn(
                                isPinned ? "hidden" : "group-hover:hidden"
                            )}>
                                Settings
                        </TooltipContent>
                    </Tooltip>
                     <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                             <Button
                                variant="ghost"
                                className="rounded-lg justify-start h-10"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5 mr-3 shrink-0" />
                                <span className={cn(
                                    "truncate transition-opacity duration-300",
                                    isPinned ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    Logout
                                </span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className={cn(
                                isPinned ? "hidden" : "group-hover:hidden"
                            )}>
                                Logout
                        </TooltipContent>
                    </Tooltip>
                </div>
            </aside>
        </TooltipProvider>
    );
}
