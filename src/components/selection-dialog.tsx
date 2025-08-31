
"use client";

import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Lock, Unlock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GridAsset, AssetType } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SelectionDialogProps {
  assets: GridAsset[];
  onClose: () => void;
  onConfirm: (selection: { assets: GridAsset[], attributes: string[] }) => void;
}

const COMMON_ATTRIBUTES = ['id', 'name', 'type', 'status', 'riskScore', 'rationale', 'maintenanceDate', 'voltage', 'capacity', 'temperature'];
const POINT_ATTRIBUTES = [...COMMON_ATTRIBUTES, 'location', 'customersServed'];
const LINEAR_ATTRIBUTES = [...COMMON_ATTRIBUTES, 'startAssetId', 'endAssetId'];
const EXCLUDED_ATTRIBUTES = ['downstreamAssets', 'path', 'rationale'];


export function SelectionDialog({ assets, onClose, onConfirm }: SelectionDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedSelection = localStorage.getItem('lockedAssetSelection');
    if (savedSelection) {
      const { type, attributes, locked } = JSON.parse(savedSelection);
      setSelectedAssetType(type);
      setSelectedAttributes(attributes);
      setIsLocked(locked);
    }
  }, []);

  const assetTypesInSelection = useMemo(() => {
    const types = new Map<AssetType, number>();
    assets.forEach(asset => {
      types.set(asset.type, (types.get(asset.type) || 0) + 1);
    });
    return Array.from(types.entries());
  }, [assets]);
  
  const availableAttributes = useMemo(() => {
    if (!selectedAssetType) return [];
    const baseAttrs = selectedAssetType.includes('Line') || selectedAssetType.includes('Cable') ? LINEAR_ATTRIBUTES : POINT_ATTRIBUTES;
    return baseAttrs.filter(attr => !EXCLUDED_ATTRIBUTES.includes(attr));
  }, [selectedAssetType]);

  const handleSelectType = (type: AssetType) => {
    setSelectedAssetType(type);
    setSelectedAttributes([]); // Reset attributes when type changes
    setStep(2);
  };
  
  const handleAttributeToggle = (attribute: string, checked: boolean) => {
    setSelectedAttributes(prev =>
      checked ? [...prev, attribute] : prev.filter(attr => attr !== attribute)
    );
  };

  const handleConfirm = () => {
    if (!selectedAssetType || selectedAttributes.length === 0) {
      toast({
        variant: "destructive",
        title: "Incomplete Selection",
        description: "Please select an asset type and at least one attribute.",
      });
      return;
    }
    
    if (isLocked) {
        handleSaveSelection();
    }
    
    onConfirm({
      assets: assets.filter(a => a.type === selectedAssetType),
      attributes: selectedAttributes
    });
  };

  const handleSaveSelection = () => {
    const dontRemind = localStorage.getItem('hideLockSelectionReminder') === 'true';

    if (!isLocked) {
        localStorage.removeItem('lockedAssetSelection');
        toast({ title: "Selection Unlocked", description: "Your selection preferences have been cleared." });
        return;
    }

    if (selectedAssetType && selectedAttributes.length > 0) {
      localStorage.setItem('lockedAssetSelection', JSON.stringify({
        type: selectedAssetType,
        attributes: selectedAttributes,
        locked: isLocked
      }));
      
      if (!dontRemind) {
        toast({
            title: "Selection Saved",
            description: "Your selection and attribute choices have been saved for the next time you use this tool.",
            action: (
              <Button variant="outline" size="sm" onClick={() => localStorage.setItem('hideLockSelectionReminder', 'true')}>
                Don't remind me again
              </Button>
            ),
          });
      }
    }
  };
  
  const renderStep1 = () => (
    <>
      <DialogHeader>
        <DialogTitle>Step 1: Select Asset Type</DialogTitle>
        <DialogDescription>
          Found {assets.length} assets in the selected area. Choose which type to analyze.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {assetTypesInSelection.map(([type, count]) => (
          <Button key={type} variant="outline" className="justify-between" onClick={() => handleSelectType(type)}>
            {type}
            <Badge>{count}</Badge>
          </Button>
        ))}
      </div>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <DialogHeader>
         <div className="flex justify-between items-start">
             <div>
                <DialogTitle>Step 2: Select Attributes for Comparison</DialogTitle>
                <DialogDescription className="mt-2">
                    You have selected {selectedAssetType}. Now choose which attributes to compare.
                </DialogDescription>
             </div>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setIsLocked(prev => !prev)}>
                            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isLocked ? "Unlock Selection" : "Lock Selection"}</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
         </div>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-4 max-h-64 overflow-y-auto">
        {availableAttributes.map(attr => (
          <div key={attr} className="flex items-center space-x-2">
            <Checkbox
              id={attr}
              checked={selectedAttributes.includes(attr)}
              onCheckedChange={(checked) => handleAttributeToggle(attr, !!checked)}
            />
            <Label htmlFor={attr} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {attr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Label>
          </div>
        ))}
      </div>
      <DialogFooter className="sm:justify-between items-center">
        <Button variant="ghost" onClick={() => setStep(1)} className="text-accent hover:text-accent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Asset Types
        </Button>
        <Button onClick={handleConfirm} disabled={selectedAttributes.length === 0}>
            Compare {selectedAttributes.length} Attributes
            <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === 1 ? renderStep1() : renderStep2()}
      </DialogContent>
    </Dialog>
  );
}
