
'use server';

import { analyzeReceipt, AnalyzeReceiptInput, AnalyzeReceiptOutput } from '@/ai/flows/analyze-receipt-flow';

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
