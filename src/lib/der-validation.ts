import { z } from "zod";

export const derResourceSchema = z.object({
  voltage: z.number()
    .min(0.1, "Voltage must be greater than 0")
    .max(1000, "Voltage must be less than 1000V"),
  current: z.number()
    .min(0.1, "Current must be greater than 0")
    .max(1000, "Current must be less than 1000A"),
  power: z.number()
    .min(0.1, "Power must be greater than 0")
    .max(100000, "Power must be less than 100kW"),
  communicationProtocol: z.string()
    .min(1, "Communication protocol is required"),
  notes: z.string().optional(),
  image: z.string().optional()
});

export type DERResourceFormData = z.infer<typeof derResourceSchema>;