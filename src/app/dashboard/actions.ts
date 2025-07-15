'use server';

import { generateWorkout, GenerateWorkoutOutput } from '@/ai/flows/generate-workout-flow';

export async function handleGenerateWorkout(goal: string, language: string): Promise<GenerateWorkoutOutput | { error: string }> {
    try {
        const result = await generateWorkout({ goal, language });
        return result;
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to generate workout: ${errorMessage}` };
    }
}
