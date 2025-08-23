'use server';

/**
 * @fileOverview Detects anomalies in equipment data using AI.
 *
 * - detectAnomalies - A function that detects anomalies in equipment data.
 * - DetectAnomaliesInput - The input type for the detectAnomalies function.
 * - DetectAnomaliesOutput - The return type for the detectAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAnomaliesInputSchema = z.object({
  equipmentData: z
    .string()
    .describe(
      'A string containing equipment data, including sensor readings, maintenance history, and operational parameters.'
    ),
});
export type DetectAnomaliesInput = z.infer<typeof DetectAnomaliesInputSchema>;

const DetectAnomaliesOutputSchema = z.object({
  hasAnomaly: z.boolean().describe('Whether or not an anomaly was detected.'),
  anomalyDescription: z
    .string()
    .describe('A description of the anomaly, if one was detected.'),
  severity: z
    .string()
    .optional()
    .describe(
      'The severity level of the anomaly (e.g., low, medium, high). Only included if hasAnomaly is true.'
    ),
  recommendedActions: z
    .string()
    .optional()
    .describe(
      'Recommended actions to address the anomaly. Only included if hasAnomaly is true.'
    ),
});
export type DetectAnomaliesOutput = z.infer<typeof DetectAnomaliesOutputSchema>;

export async function detectAnomalies(input: DetectAnomaliesInput): Promise<DetectAnomaliesOutput> {
  return detectAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAnomaliesPrompt',
  input: {schema: DetectAnomaliesInputSchema},
  output: {schema: DetectAnomaliesOutputSchema},
  prompt: `You are an AI assistant specializing in detecting anomalies in equipment data for reliability engineers.

  Analyze the provided equipment data to identify any potential anomalies or deviations from normal operating conditions.
  Based on your analysis, determine if an anomaly exists and provide a description, severity level, and recommended actions.

  Equipment Data: {{{equipmentData}}}

  Respond in a structured JSON format.
`,
});

const detectAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAnomaliesFlow',
    inputSchema: DetectAnomaliesInputSchema,
    outputSchema: DetectAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
