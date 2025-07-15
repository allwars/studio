'use server';

/**
 * @fileOverview An AI agent for analyzing body progress images.
 *
 * - analyzeBodyProgress - A function that handles the analysis of body progress images.
 * - AnalyzeBodyProgressInput - The input type for the analyzeBodyProgress function.
 * - AnalyzeBodyProgressOutput - The return type for the analyzeBodyProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBodyProgressInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the user's body, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  previousAnalysis: z
    .string()
    .optional()
    .describe("The previous analysis, if available."),
  language: z.string().describe('The language for the analysis response (e.g., "en" or "es").'),
});
export type AnalyzeBodyProgressInput = z.infer<typeof AnalyzeBodyProgressInputSchema>;

const AnalyzeBodyProgressOutputSchema = z.object({
  analysis: z.string().describe('The analysis of the body progress image.'),
  summary: z.string().describe('A summary of the changes observed since the last analysis, if any.'),
});
export type AnalyzeBodyProgressOutput = z.infer<typeof AnalyzeBodyProgressOutputSchema>;

export async function analyzeBodyProgress(input: AnalyzeBodyProgressInput): Promise<AnalyzeBodyProgressOutput> {
  return analyzeBodyProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBodyProgressPrompt',
  input: {schema: AnalyzeBodyProgressInputSchema},
  output: {schema: AnalyzeBodyProgressOutputSchema},
  prompt: `You are an AI fitness and health expert, specializing in analyzing body progress photos to track changes over time, such as muscle mass gain or body fat percentage reduction.

  Analyze the following body progress photo. If a previous analysis is provided, compare the current photo to the previous one and summarize the changes observed. Focus on providing constructive feedback and identifying noticeable improvements or areas for adjustment in their fitness journey.

  Respond in the following language: {{{language}}}

  Photo: {{media url=photoDataUri}}

  {{#if previousAnalysis}}
  Previous Analysis: {{{previousAnalysis}}}
  {{/if}}
  `,
});

const analyzeBodyProgressFlow = ai.defineFlow(
  {
    name: 'analyzeBodyProgressFlow',
    inputSchema: AnalyzeBodyProgressInputSchema,
    outputSchema: AnalyzeBodyProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
