

import type { DetailedCustomer, CustomerSummary } from './types';

// This file provides mock data that conforms to the DetailedCustomer interface.
// It's used for the sandbox mode and for testing the UI components.

export const mockDetailedCustomers: DetailedCustomer[] = [
    {
        icp: {
            id: '0001122334455A',
            name: 'Commercial Bakery',
            status: 'ACT',
            statusReason: 1,
            address: { unit: 'Unit 5', propertyName: 'Bakers Complex', number: '123', street: 'Industrial Dr', suburb: 'Millfield', town: 'Thalassery', region: 'Kannur', postCode: 670101 },
            gps: { lat: 11.756, lng: 75.495 }
        },
        network: { participantId: 'EDBI', poc: 'POC-001', reconciliationType: 'RT', dedicatedNsp: 'Y', installationType: 'A', proposedTrader: 'RETL', unmeteredLoadDetails: 'N/A', sharedIcpList: [], generationCapacity: 0.00, fuelType: 'Electricity', initialConnectedDate: '01/01/2010', directBilledStatus: 'No', directBilledDetails: '' },
        pricing: { distributorPriceCategory: 'COM-LV', distributorLossCategory: 'LV-A', distributorInstallationDetails: 'Standard commercial setup', chargeableCapacity: 50.00 },
        trader: { participantId: 'RETL', proposedMep: 'MEP1', unmFlag: 'N', dailyUnmeteredKwh: '0', unmeteredLoadDetails: '', submissionTypeHhr: 'Y', submissionTypeNhh: 'N', anzsic: 'C1174' },
        metering: {
            level1: { highestCategory: 3, hhrFlag: 'Y', nhhFlag: 'N', ppFlag: 'N', amiFlag: 'Y', channelCount: 5, multiplierFlag: 'N' },
            level2: { installationNumber: 1, highestCategory: 3, locationCode: 'Onsite', athParticipantId: 'ATH1', installationType: 'STD', certificationType: 'A', certificationDate: '15/06/2023', certificationExpiry: '15/06/2028', controlDeviceCertFlag: 'N', certVariations: 'N', certVariationsExpiry: '', certNumber: 'CERT-98765', maxInterrogationCycle: 30, leasePriceCode: 'LPC01' },
            level3: { serialNumber: 'SN-METER-001', componentType: 'M', meterType: 'AMI', amiFlag: 'Y', category: '3', compensationFactor: 1.000, owner: 'EDBI', removalDate: '' },
            level4: { channelNumber: 1, dials: 6, registerContentCode: 'KWH-T', periodOfAvailability: 24, unitOfMeasurement: 'kWh', flowDirection: 'I', accumulatorType: 'C', settlementIndicator: 'Y', eventReading: 123456 }
        },
        derived: { ciTou: 'Y', amiNonComm: 'N', amiComm: 'Y', serialNumbers: 'SN-METER-001', traderSwitch: 'None', mepSwitch: 'None' },
        schedules: [
          { derType: 'Hot water', from: new Date('2024-08-01'), to: new Date('2025-08-01'), cron: '0 2-4 * * 1-5' }
        ]
    },
    {
        icp: {
            id: '0001122334466B',
            name: 'Residential Complex',
            status: 'ACT',
            statusReason: 1,
            address: { unit: 'Apt 101', propertyName: 'Seaview Towers', number: '45', street: 'Ocean Front Rd', suburb: 'Beachside', town: 'Thalassery', region: 'Kannur', postCode: 670104 },
            gps: { lat: 11.745, lng: 75.488 }
        },
        network: { participantId: 'EDBI', poc: 'POC-002', reconciliationType: 'RT', dedicatedNsp: 'N', installationType: 'B', proposedTrader: 'RETL', unmeteredLoadDetails: 'N/A', sharedIcpList: [], generationCapacity: 5.50, fuelType: 'Solar', initialConnectedDate: '12/05/2018', directBilledStatus: 'No', directBilledDetails: '' },
        pricing: { distributorPriceCategory: 'RES-LV', distributorLossCategory: 'LV-B', distributorInstallationDetails: 'Residential with solar export', chargeableCapacity: 15.00 },
        trader: { participantId: 'RETL', proposedMep: 'MEP2', unmFlag: 'N', dailyUnmeteredKwh: '0', unmeteredLoadDetails: '', submissionTypeHhr: 'Y', submissionTypeNhh: 'N', anzsic: 'D2611' },
        metering: {
            level1: { highestCategory: 1, hhrFlag: 'Y', nhhFlag: 'N', ppFlag: 'N', amiFlag: 'Y', channelCount: 3, multiplierFlag: 'N' },
            level2: { installationNumber: 1, highestCategory: 1, locationCode: 'Meter Box', athParticipantId: 'ATH2', installationType: 'SOL', certificationType: 'A', certificationDate: '20/11/2022', certificationExpiry: '20/11/2027', controlDeviceCertFlag: 'Y', certVariations: 'N', certVariationsExpiry: '', certNumber: 'CERT-ABCDE', maxInterrogationCycle: 30, leasePriceCode: 'LPC02' },
            level3: { serialNumber: 'SN-METER-002', componentType: 'M', meterType: 'AMI', amiFlag: 'Y', category: '1', compensationFactor: 1.000, owner: 'RETL', removalDate: '' },
            level4: { channelNumber: 1, dials: 6, registerContentCode: 'KWH-T', periodOfAvailability: 24, unitOfMeasurement: 'kWh', flowDirection: 'B', accumulatorType: 'C', settlementIndicator: 'Y', eventReading: 98765 }
        },
        derived: { ciTou: 'N', amiNonComm: 'N', amiComm: 'Y', serialNumbers: 'SN-METER-002', traderSwitch: 'None', mepSwitch: 'None' },
        schedules: []
    },
    {
        icp: {
            id: '0001122334477C',
            name: 'Industrial Freezer Unit',
            status: 'INA',
            statusReason: 12,
            address: { unit: '', propertyName: 'Cold Storage Inc.', number: '500', street: 'Freezer Alley', suburb: 'Industrial Park', town: 'Thalassery', region: 'Kannur', postCode: 670101 },
            gps: { lat: 11.760, lng: 75.510 }
        },
        network: { participantId: 'EDBI', poc: 'POC-003', reconciliationType: 'RT', dedicatedNsp: 'Y', installationType: 'C', proposedTrader: 'RETL', unmeteredLoadDetails: 'Large motor', sharedIcpList: [], generationCapacity: 0.00, fuelType: 'Electricity', initialConnectedDate: '03/08/2015', directBilledStatus: 'Yes', directBilledDetails: 'Billed to HQ' },
        pricing: { distributorPriceCategory: 'IND-HV', distributorLossCategory: 'HV-A', distributorInstallationDetails: 'High voltage direct supply', chargeableCapacity: 250.00 },
        trader: { participantId: 'RETL', proposedMep: 'MEP1', unmFlag: 'Y', dailyUnmeteredKwh: '120', unmeteredLoadDetails: 'Constant load motor', submissionTypeHhr: 'Y', submissionTypeNhh: 'N', anzsic: 'C1131' },
        metering: {
            level1: { highestCategory: 4, hhrFlag: 'Y', nhhFlag: 'N', ppFlag: 'N', amiFlag: 'Y', channelCount: 2, multiplierFlag: 'Y' },
            level2: { installationNumber: 1, highestCategory: 4, locationCode: 'HV Substation', athParticipantId: 'ATH1', installationType: 'HV', certificationType: 'B', certificationDate: '01/02/2024', certificationExpiry: '01/02/2029', controlDeviceCertFlag: 'Y', certVariations: 'Y', certVariationsExpiry: '01/02/2025', certNumber: 'CERT-HV-123', maxInterrogationCycle: 15, leasePriceCode: 'LPC03' },
            level3: { serialNumber: 'SN-METER-003', componentType: 'M', meterType: 'CT', amiFlag: 'Y', category: '4', compensationFactor: 1.050, owner: 'EDBI', removalDate: '' },
            level4: { channelNumber: 1, dials: 8, registerContentCode: 'KWH-T', periodOfAvailability: 24, unitOfMeasurement: 'kWh', flowDirection: 'I', accumulatorType: 'C', settlementIndicator: 'Y', eventReading: 87654321 }
        },
        derived: { ciTou: 'Y', amiNonComm: 'Y', amiComm: 'N', serialNumbers: 'SN-METER-003', traderSwitch: 'Recent Switch from OLD-RETAILER', mepSwitch: 'None' }
    }
];


// For the scalable solution, we'll need a summary list.
// This simulates fetching just the basic info for the main list view.
export const mockCustomerSummaries: CustomerSummary[] = mockDetailedCustomers.map(c => ({
    id: c.icp.id,
    name: c.icp.name,
    hasSchedule: !!c.schedules && c.schedules.length > 0,
    scheduledDerTypes: c.schedules?.map(s => s.derType) || []
}));

    
