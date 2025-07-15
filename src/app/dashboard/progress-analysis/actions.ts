'use server';

import { analyzeBodyProgress } from '@/ai/flows/analyze-body-progress';
import { generateGoalSuggestion, GenerateGoalSuggestionOutput } from '@/ai/flows/generate-goal-suggestion-flow';

export async function handleAnalyzeBodyProgress(photoDataUri: string, language: string) {
  try {
    // In a real app, you would fetch previous analysis from your database
    const previousAnalysis = undefined; 
    
    const result = await analyzeBodyProgress({ photoDataUri, previousAnalysis, language });
    return { summary: result.summary, analysis: result.analysis, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { summary: null, analysis: null, error: `Failed to analyze image: ${errorMessage}` };
  }
}


export async function handleGetSuggestedGoal(analysis: string, language: string): Promise<GenerateGoalSuggestionOutput | { error: string }> {
  try {
    const result = await generateGoalSuggestion({ analysis, language });
    return result;
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to get goal suggestion: ${errorMessage}` };
  }
}

export async function handleSetGoal(goal: string): Promise<{ success: boolean, error?: string }> {
  try {
    // In a real app, this would save to a database.
    // We are using localStorage for this example.
    // This action can be called from client components, but the logic runs on the server.
    // For localStorage, we would need a client-side function.
    // For simplicity, we'll assume this is an API call that would update the DB.
    // The actual update will happen on the client side after this returns.
    if (!goal) {
      throw new Error("Goal cannot be empty.");
    }
    console.log(`Goal "${goal}" would be saved to the database.`);
    return { success: true };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to set goal: ${errorMessage}` };
  }
}
