'use server';

import { generateDietPlan, GenerateDietPlanInput, DietPlanOutput } from '@/ai/flows/generate-diet-plan-flow';
import { generateMealSuggestion, GenerateMealSuggestionInput, MealSuggestionOutput } from '@/ai/flows/generate-meal-suggestion-flow';


export async function handleGenerateDietPlan(input: GenerateDietPlanInput): Promise<DietPlanOutput | { error: string }> {
    try {
        const result = await generateDietPlan(input);
        return result;
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to generate diet plan: ${errorMessage}` };
    }
}

export async function handleGenerateMealSuggestion(input: GenerateMealSuggestionInput): Promise<MealSuggestionOutput | { error: string }> {
    try {
        const result = await generateMealSuggestion(input);
        return result;
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to generate meal suggestion: ${errorMessage}` };
    }
}
