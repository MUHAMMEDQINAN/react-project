// Mock data for ICP ID validation
export const mockICPData = [
  {
    icpId: "ICP001234",
    streetAddress: "123 Main Street",
    town: "Wellington",
    region: "Wellington"
  },
  {
    icpId: "ICP005678",
    streetAddress: "456 Queen Street",
    town: "Auckland",
    region: "Auckland"
  },
  {
    icpId: "ICP009876",
    streetAddress: "789 George Street",
    town: "Dunedin",
    region: "Otago"
  },
  {
    icpId: "ICP001111",
    streetAddress: "321 High Street",
    town: "Christchurch",
    region: "Canterbury"
  },
  {
    icpId: "ICP002222",
    streetAddress: "654 Victoria Street",
    town: "Hamilton",
    region: "Waikato"
  },
  {
    icpId: "ICP003333",
    streetAddress: "987 King Street",
    town: "Tauranga",
    region: "Bay of Plenty"
  }
];

export const newZealandRegions = [
  "Northland",
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Gisborne",
  "Hawke's Bay",
  "Taranaki",
  "Manawatu-Wanganui",
  "Wellington",
  "Tasman",
  "Nelson",
  "Marlborough",
  "West Coast",
  "Canterbury",
  "Otago",
  "Southland"
];

// Mock OTP for verification (in production, this would be sent via SMS/email)
export const MOCK_OTP = "123456";