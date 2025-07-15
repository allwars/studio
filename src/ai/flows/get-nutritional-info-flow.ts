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
  preservatives: z.array(z.string()).describe("A list of common preservatives found in the ingredient. Should be an empty array if the ingredient typically has no preservatives."),
  nutritionalScore: z.number().min(0).max(100).describe("An overall nutritional score from 0 to 100, where 100 is very healthy and 0 is not. The score considers fats, sugars, preservatives, and overall nutritional value."),
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

In addition, provide a list of common preservatives found in this type of product. If it's a fresh, unprocessed item, the preservatives list should be empty.

Finally, provide an overall nutritionalScore from 0 to 100. A score of 100 is extremely healthy (e.g., fresh spinach) and 0 is very unhealthy (e.g., a highly processed sugary snack). This score should be based on factors like nutritional balance, processing level, presence of unhealthy fats, sugars, and preservatives.

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
