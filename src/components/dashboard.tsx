

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GridAsset, Alert, DetailedCustomer } from '@/lib/types';
import { getGridAssets, getAlerts } from '@/services/grid-service';
import { DashboardHeader } from '@/components/dashboard-header';
import { AssetDetail } from '@/components/asset-detail';
import { Sidebar, type NavItem } from '@/components/sidebar';
import { ExplorerView } from '@/components/explorer-view';
import { PlaceholderView } from '@/components/placeholder-view';
import { ReportingView } from '@/components/reporting-view';
import { DERManagementView } from '@/components/der-management-view';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Share2, Rss, SlidersHorizontal, AlertTriangle, ClipboardList } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAppMode } from '@/hooks/use-app-mode';
import { AssetComparisonView } from './asset-comparison-view';
import { SelectionDialog } from './selection-dialog';
import { useAuth } from '@/context/AuthContext';
import { hasPermission, getInitialViewForParticipant } from '@/lib/rbac';
import { Skeleton } from './ui/skeleton';
import { IcpDetailPanel } from './icp-detail-panel';
import { motion, AnimatePresence } from 'framer-motion';


const ALL_NAV_ITEMS: NavItem[] = [
    { id: 'explorer', label: 'Explorer', icon: LayoutDashboard },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'connections', label: 'Connections Work Flow', icon: Share2 },
    {
        id: 'der',
        label: 'DER Management',
        icon: Rss,
        subItems: [
            { id: 'der-controllable-load', label: 'Controllable Load', icon: SlidersHorizontal },
            { id: 'der-plan-developer', label: 'Plan Developer', icon: ClipboardList }
        ]
    },
];

export type SelectionInfo = {
  assets: GridAsset[];
  attributes: string[];
}

const DEFAULT_COMPARISON_ATTRIBUTES = ['id', 'name', 'type', 'status', 'riskScore', 'voltage', 'temperature'];

export function Dashboard() {
  const { participant, isLoading: isAuthLoading } = useAuth();
  const [assets, setAssets] = useState<GridAsset[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAssets, setSelectedAssets] = useState<GridAsset[]>([]);
  const [activeView, setActiveView] = useState(''); // Initialize as empty
  const [isViewInitialized, setIsViewInitialized] = useState(false);
  const [spatiallySelectedAssets, setSpatiallySelectedAssets] = useState<GridAsset[]>([]);
  const [isSelectionDialogVisible, setIsSelectionDialogVisible] = useState(false);
  const [comparisonSelection, setComparisonSelection] = useState<SelectionInfo | null>(null);
  const [selectedIcp, setSelectedIcp] = useState<DetailedCustomer | null>(null);

  const { toast } = useToast();
  const { mode } = useAppMode();

  const navItems = useMemo(() => {
    if (!participant) return [];
    
    return ALL_NAV_ITEMS.filter(item => hasPermission(participant, 'sidebar', item.id)).map(item => {
        if (item.subItems) {
            return {
                ...item,
                subItems: item.subItems.filter(sub => hasPermission(participant, 'subItem', sub.id))
            };
        }
        return item;
    }).filter(item => !item.subItems || item.subItems.length > 0);
  }, [participant]);

  useEffect(() => {
    if (participant && !isViewInitialized) {
      const initialView = getInitialViewForParticipant(participant);
      // Only set active view if the user has permission for it.
      if (hasPermission(participant, 'sidebar', initialView.split('-')[0])) {
          setActiveView(initialView);
      }
      setIsViewInitialized(true);
    }
  }, [participant, isViewInitialized]);
  
  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        setError(null);
        try {
            const [assetsData, alertsData] = await Promise.all([
                getGridAssets(mode),
                getAlerts(mode)
            ]);
            setAssets(assetsData);
            setAlerts(alertsData);
        } catch (fetchError) {
            console.error("Failed to fetch data:", fetchError);
            const errorMessage = fetchError instanceof Error ? fetchError.message : "An unknown error occurred.";
            setError(errorMessage);
            toast({
                variant: 'destructive',
                title: 'Data Fetching Error',
                description: errorMessage,
            });
            setAssets([]);
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [mode, toast]);

    const handleResetView = useCallback(() => {
        setSelectedAssets([]);
        setSpatiallySelectedAssets([]);
        setIsSelectionDialogVisible(false);
        setComparisonSelection(null);
        setSelectedIcp(null);
        // You might want to reset other view-specific states here if needed
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleResetView();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleResetView]);

  useEffect(() => {
    if (activeView !== 'explorer') {
      setSelectedAssets([]);
      setSpatiallySelectedAssets([]);
      setIsSelectionDialogVisible(false);
      setComparisonSelection(null);
    }
    // Only clear selected ICP if we are moving away from a DER view.
    if (!activeView.startsWith('der-')) {
      setSelectedIcp(null);
    }
  }, [activeView]);

  const handleSpatialSelection = useCallback((assets: GridAsset[]) => {
    setSpatiallySelectedAssets(assets);
    setIsSelectionDialogVisible(true);
    setComparisonSelection(null); 
  }, []);

  const handleConfirmSelection = useCallback((selection: SelectionInfo) => {
    setComparisonSelection(selection);
    setIsSelectionDialogVisible(false);
  }, []);

  const handleSelectAsset = useCallback((asset: GridAsset | null, isMultiSelect: boolean = false) => {
    setComparisonSelection(null); 
    setSelectedAssets(prevSelected => {
      if (!asset) return [];

      if (isMultiSelect) {
        const alreadySelected = prevSelected.find(a => a.id === asset.id);
        if (alreadySelected) {
          return prevSelected.filter(a => a.id !== asset.id);
        }

        if (prevSelected.length > 0 && prevSelected[0].voltage !== asset.voltage) {
            toast({
                variant: 'destructive',
                title: 'Selection Error',
                description: 'Please select assets with the same voltage level for comparison.'
            });
            return prevSelected;
        }

        if (prevSelected.length >= 10) {
            toast({
                variant: 'destructive',
                title: 'Selection Limit Reached',
                description: 'You can select a maximum of 10 assets for comparison.'
            });
            return prevSelected;
        }

        return [...prevSelected, asset];
      } else {
        if (prevSelected.length === 1 && prevSelected[0].id === asset.id) {
          return [];
        }
        return [asset];
      }
    });
  }, [toast]);
  
  const handleRemoveAsset = useCallback((assetId: string) => {
    setSelectedAssets(prev => prev.filter(a => a.id !== assetId));
  }, []);


  const handleClosePanel = () => {
    setSelectedAssets([]);
    setComparisonSelection(null);
  }

  const handleCloseIcpPanel = () => {
    setSelectedIcp(null);
  };
  
  const renderErrorState = (title: string) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">{title}</h2>
        <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
        <p className="text-sm text-muted-foreground mt-4">Please check your network connection or switch to Sandbox mode.</p>
    </div>
  );

  const renderActiveView = () => {
    // Prioritize loading state. If we are loading, show the loading indicator
    // regardless of the error state. This clears the error UI upon re-fetch.
    if (isLoading) {
       return (
        <div className="flex flex-1 flex-col overflow-hidden relative items-center justify-center">
            <p className="text-muted-foreground animate-pulse">Loading Data...</p>
        </div>
       )
    }

    // If not loading, but there is an error, show the error state.
    if (error && mode === 'production') {
        return renderErrorState('Failed to Load Data');
    }

    if (!participant) { 
        return <PlaceholderView title="Access Denied" />;
    }
      
    if (!hasPermission(participant, 'sidebar', activeView.split('-')[0])) {
        // This is the fallback that prevents the access denied flash.
        // It will only be hit if the activeView is stale, so we show a loader.
        return (
             <div className="flex-1 flex flex-col overflow-hidden relative items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Loading...</p>
             </div>
        );
    }

    const derSubView = activeView.startsWith('der-') ? activeView.substring(4) : 'main';
    
    switch (activeView) {
      case 'explorer':
        return <ExplorerView 
                    assets={assets} 
                    alerts={alerts} 
                    isLoading={isLoading} 
                    selectedAssets={selectedAssets} 
                    onSelectAsset={handleSelectAsset} 
                    onSpatialSelect={handleSpatialSelection} 
                />;
      case 'reporting':
        return <ReportingView />;
      case 'connections':
        return <PlaceholderView title="Connections Work Flow" />;
      case 'der':
      case activeView.startsWith('der-') && activeView:
        return <DERManagementView 
                  initialView={derSubView} 
                  onNavigate={(subView) => setActiveView(`der-${subView}`)}
                  onSelectIcp={setSelectedIcp}
                />;
      default:
        return <ExplorerView 
                  assets={assets}
                  alerts={alerts}
                  isLoading={isLoading}
                  selectedAssets={selectedAssets} 
                  onSelectAsset={handleSelectAsset} 
                  onSpatialSelect={handleSpatialSelection}
                />;
    }
  }

  if (isAuthLoading || !isViewInitialized || !activeView) {
    return (
        <div className="flex h-screen w-full flex-col bg-background">
             <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-7" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </header>
            <div className="flex flex-1 overflow-hidden">
                 <aside className="hidden md:flex flex-col gap-4 border-r bg-background p-2 w-16">
                    <div className="flex flex-col gap-1 pt-4">
                         {[...Array(4)].map((_, i) => (
                             <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                         ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-1">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                        ))}
                    </div>
                </aside>
                <main className="flex-1 flex flex-col overflow-hidden relative items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Loading...</p>
                </main>
            </div>
        </div>
    );
  }

  const isBottomPanelVisible = selectedAssets.length > 1 || comparisonSelection || selectedIcp;

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            navItems={navItems}
            activeView={activeView} 
            setActiveView={setActiveView} 
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className={cn("flex-1 transition-all h-full overflow-y-auto")}>
            {renderActiveView()}
          </div>
          
          {isSelectionDialogVisible && (
            <SelectionDialog
              assets={spatiallySelectedAssets}
              onClose={() => setIsSelectionDialogVisible(false)}
              onConfirm={handleConfirmSelection}
            />
          )}
          
          <AnimatePresence>
            {isBottomPanelVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '40vh', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex-shrink-0 z-10 bg-background/80 backdrop-blur-sm border-t"
                >
                  {selectedIcp ? (
                    <IcpDetailPanel customer={selectedIcp} onClose={handleCloseIcpPanel} />
                  ) : selectedAssets.length > 1 && !comparisonSelection ? (
                    <AssetComparisonView 
                      assets={selectedAssets} 
                      attributes={DEFAULT_COMPARISON_ATTRIBUTES}
                      onClose={handleClosePanel} 
                    />
                  ) : comparisonSelection ? (
                    <AssetComparisonView 
                      assets={comparisonSelection.assets}
                      attributes={comparisonSelection.attributes}
                      onClose={handleClosePanel} 
                    />
                  ) : null}
               </motion.div>
            )}
          </AnimatePresence>

        </main>
        <aside className={cn(
          "hidden lg:block border-l bg-card overflow-y-auto transition-all duration-300 ease-in-out",
          selectedAssets.length === 1 && !comparisonSelection ? "w-[380px]" : "w-0 border-l-0"
          )}>
          <AssetDetail asset={selectedAssets.length === 1 ? selectedAssets[0] : null} onClose={handleClosePanel} />
        </aside>
      </div>
    </div>
  );
}

    
