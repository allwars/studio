'use server';

/**
 * @fileOverview Generates a personalized diet plan based on user's goal, workout, and available ingredients.
 *
 * - generateDietPlan - A function that creates a diet plan.
 * - GenerateDietPlanInput - The input type for the generateDietPlan function.
 * - DietPlanOutput - The return type for the generateDietPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDietPlanInputSchema = z.object({
  goal: z.string().describe("The user's fitness goal (e.g., 'run a 5k in 3 months', 'build upper body strength')."),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
  pantryItems: z.array(z.string()).describe('A list of ingredients the user has available in their pantry.'),
  lastWorkout: z.string().optional().describe("Information about the user's last workout, including intensity and type."),
});
export type GenerateDietPlanInput = z.infer<typeof GenerateDietPlanInputSchema>;

const MealItemSchema = z.object({
  meal: z.string().describe("The type of meal (e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack')."),
  title: z.string().describe("A concise name for the meal."),
  description: z.string().describe("A brief description of the meal and why it's beneficial."),
  dataAiHint: z.string().describe("One or two keywords for generating a placeholder image (e.g., 'chicken salad')."),
});

const DietPlanOutputSchema = z.object({
  description: z.string().describe("A brief, encouraging description of the overall diet plan for the day."),
  meals: z.array(MealItemSchema).describe("An array of meal objects for the day."),
});
export type DietPlanOutput = z.infer<typeof DietPlanOutputSchema>;

export async function generateDietPlan(input: GenerateDietPlanInput): Promise<DietPlanOutput> {
  return generateDietPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDietPlanPrompt',
  input: { schema: GenerateDietPlanInputSchema },
  output: { schema: DietPlanOutputSchema },
  prompt: `You are an expert nutritionist and fitness coach. Create a single-day diet plan for a user with a specific fitness goal.

The plan MUST exclusively use ingredients from the provided pantry list. If the pantry is empty or lacks necessary ingredients for a balanced meal, you can indicate that in the description, but you must still generate a valid (even if simple) meal plan from what's available. Do not invent ingredients.

The diet should complement the user's fitness goal and their last workout.

User's Goal: {{{goal}}}

{{#if lastWorkout}}
Last Workout Feedback: {{{lastWorkout}}}
(Consider this feedback for calorie and macro adjustments. E.g., a tough workout might require more protein for recovery.)
{{/if}}

Available Ingredients in Pantry:
{{#each pantryItems}}
- {{{this}}}
{{/each}}

The plan should include 3-4 meals (like breakfast, lunch, dinner, and an optional snack). For each meal, provide a title, a short description, and an image hint.

Respond in the following language: {{{language}}}.
`,
});

const generateDietPlanFlow = ai.defineFlow(
  {
    name: 'generateDietPlanFlow',
    inputSchema: GenerateDietPlanInputSchema,
    outputSchema: DietPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
