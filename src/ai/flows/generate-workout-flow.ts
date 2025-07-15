'use server';

/**
 * @fileOverview Generates a personalized workout plan based on a user's goal.
 * 
 * - generateWorkout - A function that creates a workout plan.
 * - GenerateWorkoutInput - The input type for the generateWorkout function.
 * - GenerateWorkoutOutput - The return type for the generateWorkout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWorkoutInputSchema = z.object({
  goal: z.string().describe('The user\'s fitness goal (e.g., "run a 5k in 3 months", "build upper body strength").'),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
  previousWorkoutFeedback: z.string().optional().describe("Feedback from the user's last workout session, including whether it was completed and how they felt."),
});
export type GenerateWorkoutInput = z.infer<typeof GenerateWorkoutInputSchema>;

const WorkoutItemSchema = z.object({
    title: z.string(),
    items: z.array(z.string()).optional(),
    description: z.string().optional(),
});

const GenerateWorkoutOutputSchema = z.object({
  title: z.string().describe("A concise and motivating title for the workout plan."),
  focus: z.string().describe("The main focus of the workout (e.g., 'Power and Endurance', 'Calorie Burn and Core Strength')."),
  warmup: WorkoutItemSchema,
  technique: WorkoutItemSchema,
  main: WorkoutItemSchema,
  stretching: WorkoutItemSchema,
});

export type GenerateWorkoutOutput = z.infer<typeof GenerateWorkoutOutputSchema>;

export async function generateWorkout(input: GenerateWorkoutInput): Promise<GenerateWorkoutOutput> {
  return generateWorkoutFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkoutPrompt',
  input: { schema: GenerateWorkoutInputSchema },
  output: { schema: GenerateWorkoutOutputSchema },
  prompt: `You are an expert fitness coach. A user has specified their fitness goal. Create a detailed, single-day workout plan to help them achieve it. The plan should be challenging but achievable for an intermediate fitness level.

The plan must include a title, a focus, a warm-up section, a technique focus section, a main workout section, and a stretching/cool-down section.

User's Goal: {{{goal}}}

{{#if previousWorkoutFeedback}}
Feedback from previous workout: {{{previousWorkoutFeedback}}}
Use this feedback to adjust the intensity, exercises, or focus of this new plan. For example, if the user found it too easy, increase the intensity. If they struggled with a specific part, maybe suggest an alternative or reduce the difficulty for that part.
{{/if}}

Generate the workout plan in the following language: {{{language}}}
`,
});

const generateWorkoutFlow = ai.defineFlow(
  {
    name: 'generateWorkoutFlow',
    inputSchema: GenerateWorkoutInputSchema,
    outputSchema: GenerateWorkoutOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

    