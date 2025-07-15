'use server';

/**
 * @fileOverview Generates personalized advice based on a user's pantry items.
 *
 * - generatePantryAdvice - A function that creates pantry advice.
 * - GeneratePantryAdviceInput - The input type for the function.
 * - GeneratePantryAdviceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GeneratePantryAdviceInputSchema = z.object({
  pantryItems: z.array(z.string()).describe("A list of ingredients the user has available in their pantry."),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
  averageScore: z.number().min(0).max(100).describe("The average health score of all items in the pantry."),
});
export type GeneratePantryAdviceInput = z.infer<typeof GeneratePantryAdviceInputSchema>;

const GeneratePantryAdviceOutputSchema = z.object({
  advice: z.string().describe("A brief, actionable paragraph of advice for the user based on their pantry items and average score. The advice should be encouraging and focus on 1-2 key improvements."),
});
export type GeneratePantryAdviceOutput = z.infer<typeof GeneratePantryAdviceOutputSchema>;

export async function generatePantryAdvice(input: GeneratePantryAdviceInput): Promise<GeneratePantryAdviceOutput> {
  return generatePantryAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePantryAdvicePrompt',
  input: { schema: GeneratePantryAdviceInputSchema },
  output: { schema: GeneratePantryAdviceOutputSchema },
  prompt: `You are an expert nutritionist and health coach. A user has provided a list of their pantry items and the average health score of those items.

Your task is to provide a short, encouraging, and actionable paragraph of advice. Focus on the most impactful suggestion.

- If the score is low (under 50), suggest healthier swaps for some of the less healthy items.
- If the score is medium (50-75), praise the good items and suggest adding more variety, like different types of vegetables or lean proteins.
- If the score is high (above 75), congratulate them and suggest interesting ways to combine their healthy ingredients.
- If the pantry is empty, suggest some healthy staples to start with.

The user's pantry average health score is {{{averageScore}}}/100.

Available Ingredients in Pantry:
{{#if pantryItems}}
    {{#each pantryItems}}
    - {{{this}}}
    {{/each}}
{{else}}
    The pantry is currently empty.
{{/if}}

Please generate the advice in the following language: {{{language}}}.
`,
});

const generatePantryAdviceFlow = ai.defineFlow(
  {
    name: 'generatePantryAdviceFlow',
    inputSchema: GeneratePantryAdviceInputSchema,
    outputSchema: GeneratePantryAdviceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
