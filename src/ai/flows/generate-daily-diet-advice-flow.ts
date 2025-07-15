'use server';

/**
 * @fileOverview Generates personalized advice and a health score based on a user's logged meals for the day.
 *
 * - generateDailyDietAdvice - A function that creates daily dietary advice.
 * - GenerateDailyDietAdviceInput - The input type for the function.
 * - GenerateDailyDietAdviceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDailyDietAdviceInputSchema = z.object({
  loggedMeals: z.array(z.string()).describe("A list of meal titles the user has logged for the day."),
  goal: z.string().describe("The user's current fitness goal (e.g., 'lose weight', 'gain muscle')."),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
});
export type GenerateDailyDietAdviceInput = z.infer<typeof GenerateDailyDietAdviceInputSchema>;

const GenerateDailyDietAdviceOutputSchema = z.object({
  advice: z.string().describe("A brief, actionable paragraph of advice for the user based on their logged meals and goal. The advice should be encouraging and focus on 1-2 key improvements or positive reinforcements."),
  dailyScore: z.number().min(0).max(100).describe("An overall daily nutritional score from 0 to 100, where 100 is perfectly aligned with the user's goal and nutritionally balanced, and 0 is not. The score considers meal balance, likely ingredients, and alignment with the fitness goal."),
});
export type GenerateDailyDietAdviceOutput = z.infer<typeof GenerateDailyDietAdviceOutputSchema>;

export async function generateDailyDietAdvice(input: GenerateDailyDietAdviceInput): Promise<GenerateDailyDietAdviceOutput> {
  return generateDailyDietAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailyDietAdvicePrompt',
  input: { schema: GenerateDailyDietAdviceInputSchema },
  output: { schema: GenerateDailyDietAdviceOutputSchema },
  prompt: `You are an expert nutritionist and health coach. A user has provided a list of meals they have logged for the day and their fitness goal.

Your task is to analyze their daily intake, provide a short, encouraging, and actionable paragraph of advice, and give them an overall daily nutritional score from 0 to 100.

- The score should reflect how well their food choices align with their stated fitness goal. (e.g., high protein for muscle gain, balanced calories for weight loss).
- The advice should be constructive. If their meals are good, praise them and suggest minor tweaks. If they are off-track, gently guide them towards better choices for their next meal or day.
- Base your analysis on the likely nutritional content of the logged meals.

User's Fitness Goal: {{{goal}}}

Meals Logged Today:
{{#if loggedMeals}}
    {{#each loggedMeals}}
    - {{{this}}}
    {{/each}}
{{else}}
    No meals logged yet.
{{/if}}

Please generate the advice and score in the following language: {{{language}}}.
`,
});

const generateDailyDietAdviceFlow = ai.defineFlow(
  {
    name: 'generateDailyDietAdviceFlow',
    inputSchema: GenerateDailyDietAdviceInputSchema,
    outputSchema: GenerateDailyDietAdviceOutputSchema,
  },
  async (input) => {
    if (input.loggedMeals.length === 0) {
      return {
        advice: 'Start logging your meals to get personalized advice and track your daily score.',
        dailyScore: 0,
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
