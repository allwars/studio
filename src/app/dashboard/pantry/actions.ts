'use server';

import { getNutritionalInfo } from '@/ai/flows/get-nutritional-info-flow';
import { generatePantryAdvice } from '@/ai/flows/generate-pantry-advice-flow';

export async function handleGetNutritionalInfo(ingredient: string, language: string) {
    try {
        const result = await getNutritionalInfo({ ingredient, language });
        return { data: result, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { data: null, error: `Failed to get nutritional info: ${errorMessage}` };
    }
}


export async function handleGeneratePantryAdvice(pantryItems: string[], averageScore: number, language: string) {
    try {
        const result = await generatePantryAdvice({ pantryItems, averageScore, language });
        return { advice: result.advice, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { advice: null, error: `Failed to generate pantry advice: ${errorMessage}` };
    }
}
