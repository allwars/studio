'use server';

import { analyzeReceipt, AnalyzeReceiptInput, AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt-flow';
import { addItemsToPantry } from '@/services/pantryService';
import type { PantryItem } from '../page';


export async function handleAnalyzeReceipt(input: AnalyzeReceiptInput): Promise<AnalyzeReceiptOutput | { error: string, items: null }> {
    try {
        const result = await analyzeReceipt(input);
        return result;
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { error: `Failed to analyze receipt: ${errorMessage}`, items: null };
    }
}

export async function handleAddItemsToPantry(items: Omit<PantryItem, 'id'>[]): Promise<{ success: boolean, error?: string }> {
    try {
        await addItemsToPantry(items);
        return { success: true };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to add items to pantry: ${errorMessage}` };
    }
}