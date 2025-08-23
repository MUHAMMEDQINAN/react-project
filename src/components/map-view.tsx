
"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
// Import Leaflet's CSS for styling. This is essential for the map to display correctly.
import 'leaflet/dist/leaflet.css';
// These compatibility imports ensure that Leaflet's default icons work correctly with bundlers like Webpack.
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-draw/dist/leaflet.draw.css';

// Import core components from the 'react-leaflet' library, which provides React bindings for Leaflet.js.
import { MapContainer, TileLayer, Marker, Polyline, Tooltip as LeafletTooltip, useMapEvents, useMap, FeatureGroup } from 'react-leaflet';
// Import the Leaflet library itself (L) for accessing its core functionalities, like creating custom icons.
import L, { type LatLngExpression } from 'leaflet';
// ReactDOMServer is used to render React components to a static HTML string, which is needed for creating complex custom markers.
import ReactDOMServer from 'react-dom/server';
import { motion, AnimatePresence } from 'framer-motion';

import { EditControl } from "react-leaflet-draw";
import { isPointAsset, isLinearAsset } from "@/lib/types";
import type { GridAsset, Alert, PointAsset, LinearAsset, AssetType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Zap, Building, Shield, Eye, Network, Waves, ChevronDown, Lock, Unlock, Settings, LineChart, Waypoints, Minus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

// Define the props for the MapView component.
type MapViewProps = {
  assets: GridAsset[]; // Array of all grid assets (both points and lines)
  alerts: Alert[]; // Array of active alerts to highlight assets
  onSelectAsset: (asset: GridAsset | null, isMultiSelect?: boolean) => void; // Callback function when an asset is clicked
  selectedAssets: GridAsset[]; // The IDs of the currently selected asset, to highlight it
  onSpatialSelect: (assets: GridAsset[]) => void;
};

// Defines the two available viewing modes for the map.
type ViewMode = 'risk' | 'operational';

const ASSET_TYPE_GROUPS = {
  'Grid Exchange Point': 'Substations',
  'Zone Substation': 'Substations',
  'Switchgear': 'Substations',
  'Distribution Transformer': 'Transformers',
  'HV OH Line': 'HV Lines',
  'HV UG Cable': 'HV Lines',
  'MV OH Line': 'MV Lines',
  'MV UG Cable': 'MV Lines',
  'LV OH Line': 'LV Lines',
  'LV UG Cable': 'LV Lines',
} as const;

/**
 * Returns a hex color code based on the asset's risk score.
 * @param score The risk score (0-100).
 * @returns A string representing the color.
 */
const getRiskColor = (score: number) => {
  if (score > 75) return "#ef4444"; // red-500
  if (score > 50) return "#f97316"; // orange-500 (accent)
  if (score > 25) return "#eab308"; // yellow-500
  return "#22c55e"; // green-500
};

/**
 * Returns a hex color code based on the asset's operational status.
 * @param status The operational status of the asset.
 * @returns A string representing the color.
 */
const getStatusColor = (status: GridAsset['status']) => {
  switch (status) {
    case 'Operational': return "#22c55e"; // green-500
    case 'Warning': return "#eab308"; // yellow-500
    case 'Offline': return "#a1a1aa"; // zinc-400
    default: return '#71717a'; // zinc-500
  }
};

/**
 * Returns a React component for the icon based on the asset type.
 * @param type The type of the point asset.
 * @returns A Lucide icon component.
 */
const getIconForType = (type: PointAsset['type']) => {
  switch (type) {
    case 'Distribution Transformer': return <Zap className="h-5 w-5" />;
    case 'Zone Substation': return <Building className="h-5 w-5" />;
    case 'Grid Exchange Point': return <Network className="h-5 w-5" />;
    case 'Switchgear': return <Waves className="h-5 w-5" />;
    default: return <Zap className="h-5 w-5" />;
  }
};

/**
 * Creates a custom Leaflet marker icon using a React component rendered to an HTML string.
 * This allows for highly dynamic and complex markers.
 * @param asset The point asset to create the icon for.
 * @param viewMode The current map view mode ('risk' or 'operational').
 * @param hasAlert Whether the asset has an active alert.
 * @param isSelected Whether the asset is currently selected.
 * @returns A Leaflet DivIcon instance.
 */
const createMarkerIcon = (asset: PointAsset, viewMode: ViewMode, hasAlert: boolean, isSelected: boolean) => {
  // Determine the base color of the icon based on the current view mode.
  const iconColor = viewMode === 'risk' ? getRiskColor(asset.riskScore) : getStatusColor(asset.status);
  const iconContent = getIconForType(asset.type);

  const riskAlertColor = getRiskColor(asset.riskScore);

  // Render a React component to an HTML string. This will be the content of our custom marker.
  const iconHtml = ReactDOMServer.renderToString(
    <div className={cn(
      "relative h-12 w-12 rounded-lg flex flex-col items-center justify-center gap-1 p-1 shadow-md transition-all duration-200 ease-in-out transform",
      isSelected && "ring-2 ring-offset-2 ring-primary ring-offset-background",
      isSelected && "animate-pulse"
    )} style={{ backgroundColor: iconColor, color: '#fff', border: `2px solid ${iconColor}` }}>
      {iconContent}
      <span className="text-[10px] font-bold tracking-tighter">{asset.id}</span>
      
      {/* In risk view, show a small dot indicating the operational status */}
      {viewMode === 'risk' && (
        <span className="absolute top-1 left-1 flex h-3 w-3 rounded-full border-2 border-background" style={{backgroundColor: getStatusColor(asset.status)}} />
      )}
      
      {/* In operational view, show an alert triangle if the asset has an alert */}
      {hasAlert && viewMode === 'operational' && (
        <span className={cn(
          "absolute top-0.5 right-0.5 flex items-center justify-center h-4 w-4 rounded-sm bg-background/50 backdrop-blur-sm",
          (asset.riskScore > 50) && "animate-pulse"
        )}>
          <AlertTriangle className="h-3 w-3" style={{ color: riskAlertColor }} />
        </span>
      )}
    </div>
  );

  // Create a Leaflet DivIcon. This type of icon uses a `div` element with custom HTML content.
  return L.divIcon({
    html: iconHtml,
    className: '', // Clear default Leaflet styles to prevent conflicts
    iconSize: [48, 48], // Size of the icon
    iconAnchor: [24, 48], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -48] // Point from which the popup should open relative to the iconAnchor
  });
};

const AnimatedPolyline = ({ isSelected, ...props }: L.PolylineOptions & { isSelected: boolean, positions: LatLngExpression[] }) => {
    const polylineRef = useRef<L.Polyline | null>(null);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (isSelected) {
          interval = setInterval(() => {
              setIsVisible(v => !v);
          }, 500);
      } else {
          setIsVisible(true);
      }
      return () => {
          if (interval) clearInterval(interval);
      };
    }, [isSelected]);
    
    useEffect(() => {
      if (polylineRef.current) {
          polylineRef.current.setStyle({
              opacity: isVisible ? 1 : 0.2
          });
      }
    }, [isVisible]);

    return <Polyline ref={polylineRef} {...props} />;
};


/**
 * A helper component that uses the `useMapEvents` hook to handle map-level events.
 * This is the recommended way to add event listeners to the map instance in react-leaflet.
 * @param onSelectAsset - The callback to fire when the map is clicked.
 */
function MapEventsController({ 
    onSelectAsset,
    setZoom,
    onMapClick,
    isDrawing,
}: { 
    onSelectAsset: (asset: GridAsset | null) => void,
    setZoom: (zoom: number) => void,
    onMapClick: () => void,
    isDrawing: boolean
}) {
  const map = useMapEvents({
    // Listen for the 'click' event on the map container.
    click: (e) => {
        if (isDrawing) {
            L.DomEvent.stop(e);
            return;
        }
      // When the map is clicked (but not a marker), deselect any active asset.
      onSelectAsset(null);
      onMapClick();
    },
    zoomend: () => {
        setZoom(map.getZoom());
    }
  });

  useEffect(() => {
    // Set initial zoom
    setZoom(map.getZoom());
  }, [map, setZoom]);

  return null; // This component does not render anything itself.
}

/**
 * The main MapView component. It renders the interactive map and all grid assets.
 */
export function MapView({ assets, alerts, onSelectAsset, selectedAssets, onSpatialSelect }: MapViewProps) {
  // State to manage the current view mode of the map.
  const [viewMode, setViewMode] = useState<ViewMode>('operational');
  const [zoomLevel, setZoomLevel] = useState(13);
  const [layersLocked, setLayersLocked] = useState(false); 
  const [isLayerControlOpen, setIsLayerControlOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    'Substations': true,
    'Transformers': true,
    'HV Lines': true,
    'MV Lines': true,
    'LV Lines': true,
  });

  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Memoize sets and lists of assets for performance, so they are not recalculated on every render.
  const assetsWithAlerts = useMemo(() => new Set(alerts.map(a => a.assetId)), [alerts]);
  
  const pointAssets = useMemo(() => assets.filter(isPointAsset), [assets]);
  const linearAssets = useMemo(() => assets.filter(isLinearAsset), [assets]);
  const selectedAssetIds = useMemo(() => new Set(selectedAssets.map(a => a.id)), [selectedAssets]);

  const upstreamAssetIds = useMemo(() => {
    const upstreamIds = new Set<string>();
    if (selectedAssets.length !== 1) return upstreamIds;
  
    const selected = selectedAssets[0];
    const assetsToProcess = [selected];
    const processedAssets = new Set<string>();
  
    while (assetsToProcess.length > 0) {
      const currentAsset = assetsToProcess.shift();
      if (!currentAsset || processedAssets.has(currentAsset.id)) continue;
      
      processedAssets.add(currentAsset.id);
  
      if (isPointAsset(currentAsset) && currentAsset.type === 'Distribution Transformer') {
        const parentLine = linearAssets.find(line => line.endAssetId === currentAsset.id || (line.path && line.path.some(p => p[0] === currentAsset.location.lat && p[1] === currentAsset.location.lng)));
        if (parentLine && !processedAssets.has(parentLine.id)) {
          upstreamIds.add(parentLine.id);
          assetsToProcess.push(parentLine);
        }
      } else if (isLinearAsset(currentAsset)) {
        const startAsset = assets.find(a => a.id === currentAsset.startAssetId);
        if (startAsset && !processedAssets.has(startAsset.id)) {
          upstreamIds.add(startAsset.id);
          assetsToProcess.push(startAsset);
        }
      }
    }
  
    return upstreamIds;
  }, [selectedAssets, assets, linearAssets]);

  const downstreamAssetIds = useMemo(() => {
    if (selectedAssets.length === 0) return new Set<string>();

    const downstreamIds = new Set<string>();
    const assetsToProcess = [...selectedAssets];
    const processedAssets = new Set<string>();
    
    const allAssetsById = new Map(assets.map(a => [a.id, a]));

    while (assetsToProcess.length > 0) {
        const currentAsset = assetsToProcess.shift();
        if (!currentAsset || processedAssets.has(currentAsset.id)) continue;

        processedAssets.add(currentAsset.id);

        if (isPointAsset(currentAsset)) {
            // Find lines starting from this point asset
            const connectedLines = linearAssets.filter(line => line.startAssetId === currentAsset.id);
            connectedLines.forEach(line => {
                if (!processedAssets.has(line.id)) {
                    downstreamIds.add(line.id);
                    // Add the line itself to find its children
                    if (!processedAssets.has(line.id)) {
                        assetsToProcess.push(line);
                    }
                }
            });
        } else if (isLinearAsset(currentAsset)) {
            // Find point assets physically located on this line's path
            const linePathCoords = new Set((currentAsset.path || []).map(p => `${p[0]},${p[1]}`));
            pointAssets.forEach(p => {
                const pointCoord = `${p.location.lat},${p.location.lng}`;
                if (linePathCoords.has(pointCoord)) {
                    if (!processedAssets.has(p.id)) {
                        downstreamIds.add(p.id);
                        assetsToProcess.push(p);
                    }
                }
            });

            // Also explicitly add the asset at the end of the line
            const endAsset = allAssetsById.get(currentAsset.endAssetId);
            if (endAsset && !processedAssets.has(endAsset.id)) {
                downstreamIds.add(endAsset.id);
                assetsToProcess.push(endAsset);
            }
        }
    }

    return downstreamIds;
  }, [selectedAssets, pointAssets, linearAssets]);

  const handleLayerVisibilityChange = (layer: string, checked: boolean) => {
    setVisibleLayers(prev => ({...prev, [layer]: checked}));
    if (!layersLocked) {
        setLayersLocked(true); // Auto-lock when a manual change is made
    }
  };

  const getLayerVisibility = useCallback((asset: GridAsset) => {
    // Always show selected assets and their related assets
    if (selectedAssetIds.has(asset.id) || downstreamAssetIds.has(asset.id) || upstreamAssetIds.has(asset.id)) {
        return true;
    }
      
    const group = ASSET_TYPE_GROUPS[asset.type as keyof typeof ASSET_TYPE_GROUPS];
    
    // If layers are locked, respect the manual toggle state
    if (layersLocked) {
        return visibleLayers[group] ?? false;
    }

    // Otherwise, use zoom-based logic
    switch(group) {
        case 'Substations':
            return zoomLevel >= 12; // Always visible except when very zoomed out
        case 'Transformers':
            return zoomLevel >= 14;
        case 'HV Lines':
            return zoomLevel >= 12;
        case 'MV Lines':
            return zoomLevel >= 14;
        case 'LV Lines':
            return zoomLevel >= 16;
        default:
            return true;
    }
  }, [zoomLevel, layersLocked, visibleLayers, selectedAssetIds, downstreamAssetIds, upstreamAssetIds]);

  const filteredPointAssets = useMemo(() => {
    return pointAssets.filter(asset => getLayerVisibility(asset));
  }, [pointAssets, getLayerVisibility]);

  const filteredLinearAssets = useMemo(() => {
    return linearAssets.filter(asset => getLayerVisibility(asset));
  }, [linearAssets, getLayerVisibility]);


  // Create a map of point assets by their ID for quick lookups when rendering lines.
  const pointAssetMap = useMemo(() => {
    const map = new Map<string, PointAsset>();
    pointAssets.forEach(p => map.set(p.id, p));
    return map;
  }, [pointAssets]);

  // Define the default center of the map.
  const center: LatLngExpression = [11.756, 75.495]; // Thalassery, Kerala

  // Calculate the geographical bounds of all point assets to auto-fit the map view.
  const bounds = useMemo(() => {
    if (pointAssets.length === 0) {
      return L.latLngBounds(center, center);
    }
    const lats = pointAssets.map(p => p.location.lat);
    const lngs = pointAssets.map(p => p.location.lng);
    const calculatedBounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
    );
    return calculatedBounds.isValid() ? calculatedBounds : L.latLngBounds(center, center);
    return calculatedBounds.isValid() ? calculatedBounds : L.latLngBounds(center, center);
  }, [pointAssets, center]);

  const onCreated = (e: any) => {
    const drawnLayer = e.layer;
    const selected: GridAsset[] = [];

    assets.forEach(asset => {
      if (isPointAsset(asset)) {
        const point = L.latLng(asset.location.lat, asset.location.lng);
        if (drawnLayer.getBounds().contains(point)) {
          selected.push(asset);
        }
      } else if (isLinearAsset(asset)) {
        const positions = (asset.path || []).map(p => L.latLng(p[0], p[1]));
        if (positions.some(pos => drawnLayer.getBounds().contains(pos))) {
          selected.push(asset);
        }
      }
    });
    
    onSpatialSelect(selected);
    setIsDrawing(false);
    
    // Remove the drawn layer from the map after selection
    if (featureGroupRef.current) {
        featureGroupRef.current.removeLayer(drawnLayer);
    }
    setIsDrawing(false);
  };
  
  const DrawController = () => {
    const map = useMap();
    useEffect(() => {
        map.on('draw:drawstart', () => setIsDrawing(true));
        map.on('draw:drawstop', () => setIsDrawing(false));
        map.on('draw:created', onCreated);

        return () => {
            map.off('draw:drawstart');
            map.off('draw:drawstop');
            map.off('draw:created');
        };
    }, [map]);

    return (
        <FeatureGroup ref={featureGroupRef}>
            <EditControl
                position="topleft"
                draw={{
                    rectangle: true,
                    circle: true,
                    polygon: true,
                    polyline: false,
                    marker: false,
                    circlemarker: false,
                }}
                edit={{
                    edit: false,
                    remove: false,
                }}
            />
        </FeatureGroup>
    );
  };

  const LayerControlItem = ({ id, label, icon, onCheckedChange, checked, className }: { id: string, label: string, icon: React.ReactNode, onCheckedChange: (checked: boolean) => void, checked: boolean, className?: string }) => (
    <div className="flex items-center space-x-2">
      <Label htmlFor={id} className={cn("flex-1 flex items-center gap-2 cursor-pointer", className)}>
        {icon}
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  const { resolvedTheme } = useTheme();

  return (
    <div className=" full-height relative flex-1 bg-muted/30 ">
        <Collapsible 
            open={isLayerControlOpen}
            onOpenChange={setIsLayerControlOpen}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] w-fit">
            <CollapsibleTrigger asChild>
                <Button variant="outline" className="shadow-md">
                    <Settings className="h-4 w-4 mr-2" />
                    Layer Controls
                    <ChevronDown className={cn("h-4 w-4 ml-2 transition-transform", isLayerControlOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            <AnimatePresence>
                {isLayerControlOpen && (
                    <CollapsibleContent asChild forceMount>
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            <Card className="mt-2 shadow-lg w-64">
                                <CardContent className="p-4 space-y-3">
                                    <LayerControlItem 
                                        id="lock-layers"
                                        label="Lock Visible Layers"
                                        icon={layersLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                        checked={layersLocked}
                                        onCheckedChange={setLayersLocked}
                                    />
                                    <Separator className="my-2" />
                                    <LayerControlItem
                                        id="substations-layer"
                                        label="Substations"
                                        icon={<Building className="h-4 w-4" />}
                                        checked={visibleLayers['Substations']}
                                        onCheckedChange={(c) => handleLayerVisibilityChange('Substations', c)}
                                    />
                                    <LayerControlItem
                                        id="transformers-layer"
                                        label="Transformers"
                                        icon={<Zap className="h-4 w-4" />}
                                        checked={visibleLayers['Transformers']}
                                        onCheckedChange={(c) => handleLayerVisibilityChange('Transformers', c)}
                                    />
                                    <Separator className="my-2"/>
                                     <LayerControlItem
                                        id="hv-lines-layer"
                                        label="HV Lines"
                                        icon={<Waypoints className="h-4 w-4 text-red-500" />}
                                        className="text-red-500 font-medium"
                                        checked={visibleLayers['HV Lines']}
                                        onCheckedChange={(c) => handleLayerVisibilityChange('HV Lines', c)}
                                    />
                                     <LayerControlItem
                                        id="mv-lines-layer"
                                        label="MV Lines"
                                        icon={<Waypoints className="h-4 w-4 text-yellow-500" />}
                                        className="text-yellow-500 font-medium"
                                        checked={visibleLayers['MV Lines']}
                                        onCheckedChange={(c) => handleLayerVisibilityChange('MV Lines', c)}
                                    />
                                    <LayerControlItem
                                        id="lv-lines-layer"
                                        label="LV Lines"
                                        icon={<Waypoints className="h-4 w-4 text-blue-500" />}
                                        className="text-blue-500 font-medium"
                                        checked={visibleLayers['LV Lines']}
                                        onCheckedChange={(c) => handleLayerVisibilityChange('LV Lines', c)}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </CollapsibleContent>
                )}
            </AnimatePresence>
        </Collapsible>

      {/* The view mode toggle switch, positioned absolutely over the map. */}
        <div className="absolute top-4 right-4 z-[1000] bg-card p-2 rounded-lg shadow-md border">
        <div className="flex items-center space-x-3">
          <Label htmlFor="view-mode-toggle" className="flex items-center gap-2 cursor-pointer">
            <Shield className="h-5 w-5" />
            <span>Risk View</span>
          </Label>
          <Switch
            id="view-mode-toggle"
            checked={viewMode === 'operational'}
            onCheckedChange={(checked) => setViewMode(checked ? 'operational' : 'risk')}
            className="data-[state=checked]:bg-white"
          />
           <Label htmlFor="view-mode-toggle" className="flex items-center gap-2 cursor-pointer">
            <Eye className="h-5 w-5" />
            <span>Operational View</span>
          </Label>
        </div>
      </div>
      
      {/* The main map container. It's crucial that this component only mounts once. */}
      <MapContainer 
        bounds={bounds.pad(0.1)} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: '0' }}
        className="aspect-video focus:outline-none" 
      >
        {/* The TileLayer defines the map's background imagery. Here we use a dark theme from CARTO. */}
        <TileLayer
          url={
            resolvedTheme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <DrawController />
        
        {/* Add the event handler component to the map */}
        <MapEventsController 
            onSelectAsset={onSelectAsset} 
            setZoom={setZoomLevel} 
            onMapClick={() => setIsLayerControlOpen(false)}
            isDrawing={isDrawing}
        />
        {/* Render Linear Assets (cables) as Polylines on the map. */}
        {filteredLinearAssets.map(line => {
          const startAsset = pointAssetMap.get(line.startAssetId);
          const endAsset = pointAssetMap.get(line.endAssetId);
          if (!startAsset || !endAsset) {
            return null; // Don't render if start or end point is missing.
          }

          // Use the defined path for the polyline if it exists, otherwise draw a straight line.
          const positions: LatLngExpression[] = line.path 
            ? line.path.map(p => [p[0], p[1]]) 
            : [
                [startAsset.location.lat, startAsset.location.lng],
                [endAsset.location.lat, endAsset.location.lng]
              ];
          
          const color = viewMode === 'risk' ? getRiskColor(line.riskScore) : getStatusColor(line.status);
          const isSelected = selectedAssetIds.has(line.id);
          const weight = line.type.startsWith('HV') ? 4 : line.type.startsWith('MV') ? 3 : 2;

          return (
            <React.Fragment key={line.id}>
              <AnimatedPolyline
                positions={positions}
                isSelected={isSelected}
                color={color}
                weight={isSelected ? weight + 2 : weight}
                opacity={line.status === 'Offline' && viewMode === 'operational' ? 0.4 : 1}
                dashArray={line.type.includes('UG') ? '5, 10' : undefined}
                eventHandlers={{
                  click: (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    onSelectAsset(line, e.originalEvent.ctrlKey || e.originalEvent.metaKey);
                  }
                }}
              />
              {/* Tooltip that appears on hover. Only show if not selected. */}
              {!isSelected && (
                <LeafletTooltip position={positions[Math.floor(positions.length / 2)]} sticky>
                  <div className="space-y-1">
                    <p className="font-bold">{line.name}</p>
                    <p><span className="font-semibold">Type:</span> {line.type}</p>
                    <p><span className="font-semibold">Risk:</span> {line.riskScore}%</p>
                    <p><span className="font-semibold">Status:</span> {line.status}</p>
                  </div>
                </LeafletTooltip>
              )}
            </React.Fragment>
          );
        })}

        {/* Render Point Assets (substations, transformers) as Markers on the map. */}
        {filteredPointAssets.map((asset) => {
          const position: LatLngExpression = [asset.location.lat, asset.location.lng];
          const hasAlert = assetsWithAlerts.has(asset.id);
          const isSelected = selectedAssetIds.has(asset.id);
          // Create a dynamic, custom icon for each marker.
          const icon = createMarkerIcon(asset, viewMode, hasAlert, isSelected);

          return (
            <Marker 
              key={asset.id} 
              position={position} 
              icon={icon} // Use the custom-generated icon
              eventHandlers={{
                click: (e) => {
                  // Stop the click event from propagating to the map container,
                  // which would immediately close the popup.
                  L.DomEvent.stopPropagation(e);
                  onSelectAsset(asset, e.originalEvent.ctrlKey || e.originalEvent.metaKey);
                }
              }}
            >
              {!isSelected && (
                <LeafletTooltip className="custom-popup">
                    <div className="space-y-1">
                    <p className="font-bold">{asset.name}</p>
                    <p><span className="font-semibold">Type:</span> {asset.type}</p>
                    <p><span className="font-semibold">Risk:</span> {asset.riskScore}%</p>
                    <p><span className="font-semibold">Status:</span> {asset.status}</p>
                    </div>
                </LeafletTooltip>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
