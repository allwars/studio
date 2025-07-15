'use server';

/**
 * @fileOverview Retrieves nutritional information for a given food ingredient.
 *
 * - getNutritionalInfo - A function that fetches nutritional data.
 * - GetNutritionalInfoInput - The input type for the function.
 * - NutritionalInfoOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GetNutritionalInfoInputSchema = z.object({
  ingredient: z.string().describe("The name of the food ingredient (e.g., 'avocado', 'chicken breast')."),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
});
export type GetNutritionalInfoInput = z.infer<typeof GetNutritionalInfoInputSchema>;

const NutritionalInfoOutputSchema = z.object({
  description: z.string().describe("A brief description of the ingredient and its common nutritional benefits."),
  calories: z.number().describe("Estimated calories per 100g serving."),
  protein: z.number().describe("Grams of protein per 100g serving."),
  carbohydrates: z.number().describe("Grams of carbohydrates per 100g serving."),
  fat: z.number().describe("Grams of fat per 100g serving."),
});
export type NutritionalInfoOutput = z.infer<typeof NutritionalInfoOutputSchema>;

export async function getNutritionalInfo(input: GetNutritionalInfoInput): Promise<NutritionalInfoOutput> {
  return getNutritionalInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getNutritionalInfoPrompt',
  input: { schema: GetNutritionalInfoInputSchema },
  output: { schema: NutritionalInfoOutputSchema },
  prompt: `You are a nutritional database. Provide estimated nutritional information for the following ingredient. All nutritional values should be per 100g serving.

Ingredient: {{{ingredient}}}

Respond in the following language: {{{language}}}.
`,
});

const getNutritionalInfoFlow = ai.defineFlow(
  {
    name: 'getNutritionalInfoFlow',
    inputSchema: GetNutritionalInfoInputSchema,
    outputSchema: NutritionalInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
