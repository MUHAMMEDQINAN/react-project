
import type { GridAsset, Alert, PointAsset, LinearAsset, AssetType } from './types';

// --- Base Coordinates for Thalassery, Kerala, India ---
const baseLat = 11.748;
const baseLng = 75.492;

const assetLocations: Record<string, { lat: number; lng: number }> = {
  'GXP-01': { lat: baseLat, lng: baseLng },
  'ZS-A': { lat: baseLat + 0.02, lng: baseLng - 0.03 }, // North-West
  'ZS-B': { lat: baseLat - 0.02, lng: baseLng + 0.03 }, // South-East

  // New Zone Substations
  'ZS-C': { lat: baseLat + 0.05, lng: baseLng + 0.01 }, // North-East
  'ZS-D': { lat: baseLat + 0.01, lng: baseLng + 0.06 }, // East
};

// --- Programmatically generate DT and LV junction locations ---
for (let i = 1; i <= 10; i++) {
    // DTs for ZS-A
    assetLocations[`DT-1${String(i).padStart(2, '0')}`] = { lat: assetLocations['ZS-A'].lat + (Math.random() - 0.5) * 0.04, lng: assetLocations['ZS-A'].lng + (Math.random() - 0.5) * 0.04 };
    // DTs for ZS-B
    assetLocations[`DT-2${String(i).padStart(2, '0')}`] = { lat: assetLocations['ZS-B'].lat + (Math.random() - 0.5) * 0.04, lng: assetLocations['ZS-B'].lng + (Math.random() - 0.5) * 0.04 };
    // DTs for ZS-C (North-East)
    assetLocations[`DT-3${String(i).padStart(2, '0')}`] = { lat: assetLocations['ZS-C'].lat + (Math.random() - 0.2) * 0.05, lng: assetLocations['ZS-C'].lng + (Math.random() - 0.5) * 0.05 };
    // DTs for ZS-D (East)
    assetLocations[`DT-4${String(i).padStart(2, '0')}`] = { lat: assetLocations['ZS-D'].lat + (Math.random() - 0.5) * 0.05, lng: assetLocations['ZS-D'].lng + (Math.random() - 0.2) * 0.05 };
}

// --- Function to generate a generic asset ---
const createAsset = (id: string, name: string, type: AssetType, status: GridAsset['status'], overrides: Partial<GridAsset> = {}): GridAsset => {
    const baseAsset = {
        id,
        name,
        type,
        status,
        maintenanceDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        ...overrides,
    };

    // Check if it's a linear asset type by looking for 'Line' or 'Cable' in the type name.
    if (type.includes('Line') || type.includes('Cable')) {
        const linearOverrides = overrides as Partial<LinearAsset>;
        return {
            ...baseAsset,
            type: type as LinearAsset['type'],
            temperature: 30 + (Math.random() * 15),
            voltage: '11kV', // Default
            capacity: '10 MVA', // Default
            ...linearOverrides,
            startAssetId: linearOverrides.startAssetId!,
            endAssetId: linearOverrides.endAssetId!,
        } as LinearAsset;
    }

    // Otherwise, it's a point asset.
    const pointOverrides = overrides as Partial<PointAsset>;
    return {
        ...baseAsset,
        type: type as PointAsset['type'],
        location: assetLocations[id],
        temperature: 50 + (Math.random() * 20 - 10),
        voltage: '138kV', // Default
        capacity: '500 MVA', // Default
        ...pointOverrides,
        customersServed: type === 'Distribution Transformer' ? Math.floor(10 + Math.random() * 20) : undefined,
    } as PointAsset;
};

// --- SCENARIO 1: Normal Operations with a few issues ---
const buildScenario1 = (): GridAsset[] => {
    let assets: GridAsset[] = [];

    // Core Infrastructure
    assets.push(createAsset('GXP-01', 'Main Grid Exchange', 'Grid Exchange Point', 'Operational', { riskScore: 10, rationale: 'Operating within normal parameters.', temperature: 65, voltage: '400kV', capacity: '2000 MVA' }));
    assets.push(createAsset('ZS-A', 'North-West Zone Sub', 'Zone Substation', 'Operational', { riskScore: 15, rationale: 'Minor efficiency drop detected.', temperature: 55 }));
    assets.push(createAsset('ZS-B', 'South-East Zone Sub', 'Zone Substation', 'Warning', { riskScore: 78, rationale: 'High temperature alert triggered.', temperature: 82 }));
    assets.push(createAsset('ZS-C', 'North-East Substation', 'Zone Substation', 'Operational', { riskScore: 12, rationale: 'Nominal operation.', temperature: 58 }));
    assets.push(createAsset('ZS-D', 'East Substation', 'Zone Substation', 'Operational', { riskScore: 14, rationale: 'Nominal operation.', temperature: 61 }));

    // High Voltage Lines
    assets.push(createAsset('C-GXP-ZSA', 'HV Line to ZS-A', 'HV OH Line', 'Operational', { riskScore: 5, rationale: 'Clear visibility, no issues.', startAssetId: 'GXP-01', endAssetId: 'ZS-A', voltage: '138kV', capacity: '1000 MVA', path: [[assetLocations['GXP-01'].lat, assetLocations['GXP-01'].lng], [11.758, 75.472], [assetLocations['ZS-A'].lat, assetLocations['ZS-A'].lng]] }));
    assets.push(createAsset('C-GXP-ZSB', 'HV UG Cable to ZS-B', 'HV UG Cable', 'Operational', { riskScore: 8, rationale: 'Nominal readings.', startAssetId: 'GXP-01', endAssetId: 'ZS-B', voltage: '138kV', capacity: '1000 MVA', path: [[assetLocations['GXP-01'].lat, assetLocations['GXP-01'].lng], [11.735, 75.505], [assetLocations['ZS-B'].lat, assetLocations['ZS-B'].lng]] }));
    assets.push(createAsset('C-GXP-ZSC', 'HV OH Line to ZS-C', 'HV OH Line', 'Operational', { riskScore: 6, rationale: 'Clear visibility, no issues.', startAssetId: 'GXP-01', endAssetId: 'ZS-C', voltage: '138kV', capacity: '800 MVA' }));
    assets.push(createAsset('C-GXP-ZSD', 'HV UG Cable to ZS-D', 'HV UG Cable', 'Operational', { riskScore: 7, rationale: 'Nominal readings.', startAssetId: 'GXP-01', endAssetId: 'ZS-D', voltage: '138kV', capacity: '800 MVA' }));
    
    // Create Transformers for all zones
    ['A', 'B', 'C', 'D'].forEach(zoneLetter => {
        const zoneNum = {'A':1, 'B':2, 'C':3, 'D':4}[zoneLetter];
        for (let i = 1; i <= 10; i++) {
            const dtId = `DT-${zoneNum}${String(i).padStart(2, '0')}`;
            let status: GridAsset['status'] = 'Operational';
            let riskScore = 10 + Math.floor(Math.random() * 15);
            let rationale = 'Operating within normal parameters.';
            if (dtId === 'DT-102') {
                status = 'Warning';
                riskScore = 65;
                rationale = 'Vibration anomaly requires inspection.';
            }
            if (dtId === 'DT-201') {
                status = 'Offline';
                riskScore = 95;
                rationale = 'Complete loss of power, maintenance is critically overdue.';
            }
            assets.push(createAsset(dtId, `Dist Transformer ${dtId}`, 'Distribution Transformer', status, { riskScore, rationale, voltage: '11kV/415V' }));
        }
    });

    // Create Medium Voltage Feeders (multi-drop cables)
    const newAssetGroups: { zsId: string, dtPrefix: string, zoneLetter: string }[] = [
        { zsId: 'ZS-A', dtPrefix: '1', zoneLetter: 'A' },
        { zsId: 'ZS-B', dtPrefix: '2', zoneLetter: 'B' },
        { zsId: 'ZS-C', dtPrefix: '3', zoneLetter: 'C' },
        { zsId: 'ZS-D', dtPrefix: '4', zoneLetter: 'D' },
    ];

    newAssetGroups.forEach(group => {
        const zsLoc = assetLocations[group.zsId];
        
        // Feeder 1: Overhead Line
        const f1_dt_ids = [`DT-${group.dtPrefix}01`, `DT-${group.dtPrefix}02`, `DT-${group.dtPrefix}03`, `DT-${group.dtPrefix}04`, `DT-${group.dtPrefix}05`];
        let f1Path: [number, number][] = [[zsLoc.lat, zsLoc.lng]];
        f1_dt_ids.forEach(id => f1Path.push([assetLocations[id].lat, assetLocations[id].lng]));
        let f1Status: GridAsset['status'] = group.zoneLetter === 'B' ? 'Offline' : 'Operational';
        let f1Risk = f1Status === 'Offline' ? 90 : 35;
        let f1Rationale = f1Status === 'Offline' ? 'Feeder is offline due to upstream fault.' : 'Operational feeder line.';
        assets.push(createAsset(`F1-${group.zsId}`, `OH Feeder 1 from ${group.zsId}`, 'MV OH Line', f1Status, { riskScore: f1Risk, rationale: f1Rationale, startAssetId: group.zsId, endAssetId: f1_dt_ids[f1_dt_ids.length - 1], path: f1Path, voltage: '11kV'}));
        
        // Feeder 2: Underground Cable
        const f2_dt_ids = [`DT-${group.dtPrefix}06`, `DT-${group.dtPrefix}07`, `DT-${group.dtPrefix}08`, `DT-${group.dtPrefix}09`, `DT-${group.dtPrefix}10`];
        let f2Path: [number, number][] = [[zsLoc.lat, zsLoc.lng]];
        f2_dt_ids.forEach(id => f2Path.push([assetLocations[id].lat, assetLocations[id].lng]));
        let f2Status: GridAsset['status'] = group.zoneLetter === 'A' ? 'Warning' : 'Operational';
        let f2Risk = f2Status === 'Warning' ? 55 : 25;
        let f2Rationale = f2Status === 'Warning' ? 'Insulation degradation detected.' : 'Operational.';
        assets.push(createAsset(`F2-${group.zsId}`, `UG Feeder 2 from ${group.zsId}`, 'MV UG Cable', f2Status, { riskScore: f2Risk, rationale: f2Rationale, startAssetId: group.zsId, endAssetId: f2_dt_ids[f2_dt_ids.length - 1], path: f2Path, voltage: '11kV'}));
    });

    return assets;
};

const scenario1Assets: GridAsset[] = buildScenario1();
const scenario1Alerts: Alert[] = [
  { id: 'A-001', assetId: 'ZS-B', severity: 'High', message: 'Over-temperature warning.', timestamp: '2024-07-28T10:30:00Z' },
  { id: 'A-002', assetId: 'DT-102', severity: 'Medium', message: 'Vibration anomaly detected.', timestamp: '2024-07-28T09:15:00Z' },
  { id: 'A-003', assetId: 'DT-201', severity: 'Critical', message: 'Complete loss of power. Maintenance overdue.', timestamp: '2024-07-27T23:50:00Z' },
];


// --- SCENARIO 2: All Green, a quiet day ---
const scenario2Assets: GridAsset[] = buildScenario1().map(asset => {
    return { 
        ...asset, 
        status: 'Operational', 
        temperature: asset.temperature > 40 ? asset.temperature - 15 : 30,
        riskScore: Math.floor(asset.riskScore / 4),
        rationale: 'All systems green. Operating at peak efficiency.'
    };
});
const scenario2Alerts: Alert[] = [
    { id: 'B-001', assetId: 'GXP-01', severity: 'Low', message: 'Routine diagnostic check passed.', timestamp: '2024-07-28T12:00:00Z' },
];


// --- SCENARIO 3: Major Outage Event ---
const scenario3Assets: GridAsset[] = buildScenario1().map(asset => {
    if (['ZS-B', 'DT-201', 'DT-202', 'F1-ZS-B'].includes(asset.id)) {
        return { 
            ...asset, 
            status: 'Offline', 
            temperature: 25,
            riskScore: 98,
            rationale: 'Substation offline due to major fault.'
        };
    }
    if(asset.id === 'ZS-A') {
        return {
            ...asset,
            riskScore: 85,
            rationale: 'High risk of overload due to rerouted power from ZS-B.'
        }
    }
    return asset;
});
const scenario3Alerts: Alert[] = [
  { id: 'C-001', assetId: 'ZS-B', severity: 'Critical', message: 'Substation offline due to major fault.', timestamp: '2024-07-28T14:00:00Z' },
  { id: 'C-002', assetId: 'DT-201', severity: 'Critical', message: 'Power outage confirmed.', timestamp: '2024-07-28T14:01:00Z' },
  { id: 'C-003', assetId: 'DT-202', severity: 'Critical', message: 'Power outage confirmed.', timestamp: '2024-07-28T14:05:00Z' },
  { id: 'A-001', assetId: 'ZS-A', severity: 'High', message: 'Load transfer warning. Nearing capacity.', timestamp: '2024-07-28T14:05:00Z' },
];

export const assetScenarios: GridAsset[][] = [scenario1Assets, scenario2Assets, scenario3Assets];
export const alertScenarios: Alert[][] = [scenario1Alerts, scenario2Alerts, scenario3Alerts];
