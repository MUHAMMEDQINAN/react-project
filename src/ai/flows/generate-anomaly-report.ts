'use server';

/**
 * @fileOverview Generates a report summarizing detected anomalies in the grid.
 *
 * - generateAnomalyReport - A function that generates the anomaly report.
 * - GenerateAnomalyReportInput - The input type for the generateAnomalyReport function.
 * - GenerateAnomalyReportOutput - The return type for the generateAnomalyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnomalyReportInputSchema = z.object({
  assetId: z.string().describe('The ID of the asset to generate the anomaly report for.'),
  timeRange: z
    .string()
    .describe(
      'The time range for the report (e.g., "last 24 hours", "last week", "last month").'
    ),
  anomalyDetails: z
    .string()
    .describe('Detailed information about the detected anomalies for the asset.'),
});
export type GenerateAnomalyReportInput = z.infer<typeof GenerateAnomalyReportInputSchema>;

const GenerateAnomalyReportOutputSchema = z.object({
  report: z.string().describe('The generated anomaly report.'),
});
export type GenerateAnomalyReportOutput = z.infer<typeof GenerateAnomalyReportOutputSchema>;

export async function generateAnomalyReport(input: GenerateAnomalyReportInput): Promise<GenerateAnomalyReportOutput> {
  return generateAnomalyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnomalyReportPrompt',
  input: {schema: GenerateAnomalyReportInputSchema},
  output: {schema: GenerateAnomalyReportOutputSchema},
  prompt: `You are an AI assistant that generates anomaly reports for utility managers.

You will receive information about detected anomalies for a specific asset and a time range.
Your task is to generate a concise and informative report summarizing the anomalies.

Asset ID: {{{assetId}}}
Time Range: {{{timeRange}}}
Anomaly Details: {{{anomalyDetails}}}

Report:
`,
});

const generateAnomalyReportFlow = ai.defineFlow(
  {
    name: 'generateAnomalyReportFlow',
    inputSchema: GenerateAnomalyReportInputSchema,
    outputSchema: GenerateAnomalyReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
