import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-image.ts';
import '@/ai/flows/analyze-body-progress.ts';
import '@/ai/flows/generate-workout-flow.ts';
import '@/ai/flows/generate-diet-plan-flow.ts';
import '@/ai/flows/analyze-receipt-flow.ts';
import '@/ai/flows/get-nutritional-info-flow.ts';
import '@/ai/flows/generate-pantry-advice-flow.ts';
import '@/ai/flows/generate-meal-suggestion-flow.ts';
