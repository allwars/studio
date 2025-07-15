'use server';

/**
 * @fileOverview Generates a personalized meal suggestion.
 *
 * - generateMealSuggestion - A function that creates a suggestion for a single meal.
 * - GenerateMealSuggestionInput - The input type for the function.
 * - MealSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MealTypeSchema = z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']);
export type MealType = z.infer<typeof MealTypeSchema>;

const GenerateMealSuggestionInputSchema = z.object({
  mealType: MealTypeSchema,
  goal: z.string().describe("The user's fitness goal (e.g., 'run a 5k in 3 months', 'build upper body strength')."),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
  pantryItems: z.array(z.string()).describe('A list of ingredients the user has available in their pantry.'),
  previousMeals: z.array(z.string()).optional().describe("A list of meals the user has already eaten today to ensure variety."),
});
export type GenerateMealSuggestionInput = z.infer<typeof GenerateMealSuggestionInputSchema>;

const MealSuggestionOutputSchema = z.object({
  title: z.string().describe("A concise name for the meal."),
  description: z.string().describe("A brief description of the meal and why it's beneficial."),
  dataAiHint: z.string().describe("One or two keywords for generating a placeholder image (e.g., 'chicken salad')."),
});
export type MealSuggestionOutput = z.infer<typeof MealSuggestionOutputSchema>;

export async function generateMealSuggestion(input: GenerateMealSuggestionInput): Promise<MealSuggestionOutput> {
  return generateMealSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealSuggestionPrompt',
  input: { schema: GenerateMealSuggestionInputSchema },
  output: { schema: MealSuggestionOutputSchema },
  prompt: `You are an expert nutritionist and fitness coach. Create a single meal suggestion for a user.

The meal MUST exclusively use ingredients from the provided pantry list. If the pantry lacks necessary ingredients for a balanced meal, do your best with what's available. Do not invent ingredients.

The meal should be appropriate for the specified meal type and complement the user's fitness goal. Avoid suggesting meals similar to what the user has already eaten today.

Meal Type: {{{mealType}}}
User's Goal: {{{goal}}}

Available Ingredients in Pantry:
{{#each pantryItems}}
- {{{this}}}
{{/each}}

{{#if previousMeals}}
Meals already consumed today (avoid similar suggestions):
{{#each previousMeals}}
- {{{this}}}
{{/each}}
{{/if}}

Provide a title, a short description, and an image hint.

Respond in the following language: {{{language}}}.
`,
});

const generateMealSuggestionFlow = ai.defineFlow(
  {
    name: 'generateMealSuggestionFlow',
    inputSchema: GenerateMealSuggestionInputSchema,
    outputSchema: MealSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
