'use server';

import { generateDietPlan, GenerateDietPlanInput, DietPlanOutput } from '@/ai/flows/generate-diet-plan-flow';

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
