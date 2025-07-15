'use server';

import { getNutritionalInfo } from '@/ai/flows/get-nutritional-info-flow';

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
