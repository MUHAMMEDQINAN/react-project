'use server';

/**
 * @fileOverview Calculates a dynamic risk score for an asset using AI.
 *
 * - calculateRiskScore - A function that calculates the risk score for an asset.
 * - CalculateRiskScoreInput - The input type for the calculateRiskScore function.
 * - CalculateRiskScoreOutput - The return type for the calculateRiskScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateRiskScoreInputSchema = z.object({
  assetId: z.string().describe('The unique identifier for the asset.'),
  assetType: z.string().describe('The type of the asset (e.g., Transformer, Substation, MV Cable).'),
  status: z.string().describe('The current operational status of the asset (e.g., Operational, Warning, Offline).'),
  temperature: z.number().describe('The current operating temperature of the asset in Celsius.'),
  voltage: z.string().describe('The current voltage reading of the asset.'),
  maintenanceDate: z.string().describe('The last or next scheduled maintenance date for the asset (ISO 8601 format).'),
  recentAlerts: z.string().describe('A summary of recent alerts related to this asset. Can be empty if there are no alerts.'),
});
export type CalculateRiskScoreInput = z.infer<typeof CalculateRiskScoreInputSchema>;

const CalculateRiskScoreOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('A numerical risk score from 0 (no risk) to 100 (critical risk).'),
  rationale: z.string().describe('A brief explanation of the factors contributing to the calculated risk score.'),
});
export type CalculateRiskScoreOutput = z.infer<typeof CalculateRiskScoreOutputSchema>;

export async function calculateRiskScore(input: CalculateRiskScoreInput): Promise<CalculateRiskScoreOutput> {
  return calculateRiskScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateRiskScorePrompt',
  input: {schema: CalculateRiskScoreInputSchema},
  output: {schema: CalculateRiskScoreOutputSchema},
  prompt: `You are a highly experienced reliability engineer for a power utility company. Your task is to calculate a risk score for a grid asset based on the data provided. The risk score should be an integer between 0 and 100.

  Analyze the following asset data:
  - Asset ID: {{{assetId}}}
  - Asset Type: {{{assetType}}}
  - Status: {{{status}}}
  - Temperature: {{{temperature}}}°C
  - Voltage: {{{voltage}}}
  - Maintenance Date: {{{maintenanceDate}}}
  - Recent Alerts: {{{recentAlerts}}}

  Consider these factors in your assessment:
  - An 'Offline' status should result in a very high risk score (90-100).
  - A 'Warning' status indicates elevated risk (50-80).
  - High temperatures (e.g., >80°C for a transformer or >45°C for a cable) increase risk.
  - Critical or numerous recent alerts significantly increase risk.
  - Overdue maintenance (a maintenance date in the past) increases risk.
  - The further in the future the maintenance date, the lower the risk from that factor.
  - Linear assets like cables generally have lower risk profiles than point assets like substations unless specific alerts are present.

  Based on your analysis, provide a precise risk score and a concise, one-sentence rationale for your calculation.
`,
});

const calculateRiskScoreFlow = ai.defineFlow(
  {
    name: 'calculateRiskScoreFlow',
    inputSchema: CalculateRiskScoreInputSchema,
    outputSchema: CalculateRiskScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
