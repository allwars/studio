'use server';

import { getNutritionalInfo } from '@/ai/flows/get-nutritional-info-flow';
import { generatePantryAdvice } from '@/ai/flows/generate-pantry-advice-flow';
import { getPantryItems as getItemsFromDb, removePantryItem as removeItemFromDb, updatePantryItem as updateItemInDb } from '@/services/pantryService';
import type { PantryItem } from './page';

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

export async function getPantryItems(): Promise<{ items: PantryItem[], error: null } | { items: null, error: string }> {
    try {
        const items = await getItemsFromDb();
        return { items, error: null };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { items: null, error: `Failed to fetch pantry items: ${errorMessage}` };
    }
}

export async function removePantryItem(itemId: string): Promise<{ success: boolean, error?: string }> {
    try {
        await removeItemFromDb(itemId);
        return { success: true };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to remove item: ${errorMessage}` };
    }
}

export async function updatePantryItem(item: PantryItem): Promise<{ success: boolean, error?: string }> {
    try {
        await updateItemInDb(item);
        return { success: true };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to update item: ${errorMessage}` };
    }
}