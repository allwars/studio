'use server';
/**
 * @fileOverview Analyzes an image of a meal to provide nutritional information.
 *
 * - analyzeMealImage - A function that handles the meal image analysis process.
 * - AnalyzeMealImageInput - The input type for the analyzeMealImage function.
 * - AnalyzeMealImageOutput - The return type for the analyzeMealImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a meal, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeMealImageInput = z.infer<typeof AnalyzeMealImageInputSchema>;

const AnalyzeMealImageOutputSchema = z.object({
  summary: z.string().describe('A summary of the nutritional content of the meal, including estimated calories and macros.'),
});
export type AnalyzeMealImageOutput = z.infer<typeof AnalyzeMealImageOutputSchema>;

export async function analyzeMealImage(input: AnalyzeMealImageInput): Promise<AnalyzeMealImageOutput> {
  return analyzeMealImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMealImagePrompt',
  input: {schema: AnalyzeMealImageInputSchema},
  output: {schema: AnalyzeMealImageOutputSchema},
  prompt: `You are a nutrition expert. Analyze the nutritional content of the meal in the photo, including estimated calories and macros.

Photo: {{media url=photoDataUri}}`,
});

const analyzeMealImageFlow = ai.defineFlow(
  {
    name: 'analyzeMealImageFlow',
    inputSchema: AnalyzeMealImageInputSchema,
    outputSchema: AnalyzeMealImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
