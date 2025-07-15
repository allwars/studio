'use server';

/**
 * @fileOverview Generates a personalized fitness goal suggestion based on a body progress analysis.
 *
 * - generateGoalSuggestion - A function that creates a fitness goal suggestion.
 * - GenerateGoalSuggestionInput - The input type for the function.
 * - GenerateGoalSuggestionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateGoalSuggestionInputSchema = z.object({
  analysis: z.string().describe("The AI-generated analysis of the user's body progress photo. This will contain observations about muscle definition, body fat, etc."),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
});
export type GenerateGoalSuggestionInput = z.infer<typeof GenerateGoalSuggestionInputSchema>;

const GenerateGoalSuggestionOutputSchema = z.object({
  title: z.string().describe("A concise, motivating title for the suggested fitness goal. (e.g., 'Build Upper Body Strength', 'Improve Core Definition'). Should be no more than 5 words."),
  description: z.string().describe("A brief, one-sentence description explaining why this goal is a good next step based on the provided analysis."),
});
export type GenerateGoalSuggestionOutput = z.infer<typeof GenerateGoalSuggestionOutputSchema>;

export async function generateGoalSuggestion(input: GenerateGoalSuggestionInput): Promise<GenerateGoalSuggestionOutput> {
  return generateGoalSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGoalSuggestionPrompt',
  input: { schema: GenerateGoalSuggestionInputSchema },
  output: { schema: GenerateGoalSuggestionOutputSchema },
  prompt: `You are an expert fitness coach. A user has just received an analysis of their body progress photo. Based on this analysis, your task is to suggest a clear, actionable, and motivating fitness goal for them.

The goal should be a logical next step. For example, if the analysis mentions 'good leg development but room for improvement in upper body', a good goal would be 'Build Upper Body Strength'. If it mentions 'overall good muscle mass but a bit of fat over the abs', a good goal would be 'Improve Core Definition'.

Analysis:
{{{analysis}}}

Please generate a title and a brief description for a suggested fitness goal in the following language: {{{language}}}.
`,
});

const generateGoalSuggestionFlow = ai.defineFlow(
  {
    name: 'generateGoalSuggestionFlow',
    inputSchema: GenerateGoalSuggestionInputSchema,
    outputSchema: GenerateGoalSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
