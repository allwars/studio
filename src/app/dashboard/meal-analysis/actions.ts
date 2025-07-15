'use server';

import { analyzeMealImage } from '@/ai/flows/analyze-image';

export async function handleAnalyzeMealImage(photoDataUri: string) {
  try {
    const result = await analyzeMealImage({ photoDataUri });
    return { summary: result.summary, analysis: null, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { summary: null, analysis: null, error: `Failed to analyze image: ${errorMessage}` };
  }
}
