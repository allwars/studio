'use server';

import { analyzeBodyProgress } from '@/ai/flows/analyze-body-progress';

export async function handleAnalyzeBodyProgress(photoDataUri: string) {
  try {
    // In a real app, you would fetch previous analysis from your database
    const previousAnalysis = undefined; 
    
    const result = await analyzeBodyProgress({ photoDataUri, previousAnalysis });
    return { summary: result.summary, analysis: result.analysis, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { summary: null, analysis: null, error: `Failed to analyze image: ${errorMessage}` };
  }
}
