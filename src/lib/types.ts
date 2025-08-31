

export type DerSchedule = {
    derType: DerType;
    from: Date;
    to: Date;
    cron: string;
    planId?: string; // Optional: ID of the ControlPlan it's based on
};

export const DER_TYPE_OPTIONS = ['Solar', 'Solar + Battery', 'Hot water', 'EV chargers', 'Other loads', 'Other generation'] as const;
export type DerType = typeof DER_TYPE_OPTIONS[number];

export type ControlPlan = {
    id: string;
    name: string;
    description: string;
    derType: DerType;
    schedule: Omit<DerSchedule, 'derType'>;
};


export type PointAssetType = 'Grid Exchange Point' | 'Zone Substation' | 'Distribution Transformer' | 'Switchgear';
export type LinearAssetType = 
  | 'HV OH Line' 
  | 'HV UG Cable' 
  | 'MV OH Line' 
  | 'MV UG Cable'
  | 'LV OH Line'
  | 'LV UG Cable';
export type AssetType = PointAssetType | LinearAssetType;

type BaseAsset = {
  id: string;
  name: string;
  type: AssetType;
  status: 'Operational' | 'Warning' | 'Offline';
  riskScore: number; // 0-100
  rationale?: string;
  maintenanceDate: string;
  voltage: string;
  capacity: string;
  temperature: number;
};

export type PointAsset = BaseAsset & {
  type: PointAssetType;
  location: {
    lat: number;
    lng: number;
  };
  downstreamAssets?: string[]; // IDs of connected assets
  customersServed?: number;
};

export type LinearAsset = BaseAsset & {
  type: LinearAssetType;
  startAssetId: string;
  endAssetId: string;
  path?: [number, number][]; // Array of [lat, lng] coordinates
};

export function isPointAsset(asset: GridAsset): asset is PointAsset {
    // A point asset has a `location` property and does NOT have a `startAssetId` property.
    return 'location' in asset && !('startAssetId' in asset);
}

export function isLinearAsset(asset: GridAsset): asset is LinearAsset {
    return 'startAssetId' in asset && 'endAssetId' in asset;
}

export type GridAsset = PointAsset | LinearAsset;


export type Alert = {
  id: string;
  assetId: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  timestamp: string;
};

export type CustomerSummary = {
    id: string;
    uuid: string;
    name: string;
    hasSchedule: boolean;
    scheduledDerTypes: DerType[];
};

export type DetailedCustomer = {
    icp: {
        id: string;
        name: string;
        status: string;
        statusReason: number;
        address: {
            unit: string;
            propertyName: string;
            number: string;
            street: string;
            suburb: string;
            town: string;
            region: string;
            postCode: number;
        };
        gps: {
            lat: number;
            lng: number;
        };
    };
    network: {
        participantId: string;
        poc: string;
        reconciliationType: string;
        dedicatedNsp: string;
        installationType: string;
        proposedTrader: string;
        unmeteredLoadDetails: string;
        sharedIcpList: string[];
        generationCapacity: number;
        fuelType: string;
        initialConnectedDate: string;
        directBilledStatus: string;
        directBilledDetails: string;
    };
    pricing: {
        distributorPriceCategory: string;
        distributorLossCategory: string;
        distributorInstallationDetails: string;
        chargeableCapacity: number;
    };
    trader: {
        participantId: string;
        proposedMep: string;
        unmFlag: string;
        dailyUnmeteredKwh: string;
        unmeteredLoadDetails: string;
        submissionTypeHhr: string;
        submissionTypeNhh: string;
        anzsic: string;
    };
    metering: {
        level1: {
            highestCategory: number;
            hhrFlag: string;
            nhhFlag: string;
            ppFlag: string;
            amiFlag: string;
            channelCount: number;
            multiplierFlag: string;
        };
        level2: {
            installationNumber: number;
            highestCategory: number;
            locationCode: string;
            athParticipantId: string;
            installationType: string;
            certificationType: string;
            certificationDate: string;
            certificationExpiry: string;
            controlDeviceCertFlag: string;
            certVariations: string;
            certVariationsExpiry: string;
            certNumber: string;
            maxInterrogationCycle: number;
            leasePriceCode: string;
        };
        level3: {
            serialNumber: string;
            componentType: string;
            meterType: string;
            amiFlag: string;
            category: string;
            compensationFactor: number;
            owner: string;
            removalDate: string;
        };
        level4: {
            channelNumber: number;
            dials: number;
            registerContentCode: string;
            periodOfAvailability: number;
            unitOfMeasurement: string;
            flowDirection: string;
            accumulatorType: string;
            settlementIndicator: string;
            eventReading: number;
        };
    };
    derived: {
        ciTou: string;
        amiNonComm: string;
        amiComm: string;
        serialNumbers: string;
        traderSwitch: string;
        mepSwitch: string;
    };
    schedules?: DerSchedule[];
};
