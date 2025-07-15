'use server';

/**
 * @fileOverview An AI agent for analyzing shopping receipts.
 *
 * - analyzeReceipt - A function that handles the analysis of a shopping receipt from an image or text.
 * - AnalyzeReceiptInput - The input type for the analyzeReceipt function.
 * - AnalyzeReceiptOutput - The return type for the analyzeReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyzeReceiptInputSchema = z.object({
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of a shopping receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  text: z.string().optional().describe('The text of a shopping receipt.'),
  language: z.string().describe('The language for the response (e.g., "en" or "es").'),
});
export type AnalyzeReceiptInput = z.infer<typeof AnalyzeReceiptInputSchema>;

export const AnalyzeReceiptOutputSchema = z.object({
  items: z.array(z.string()).describe('A list of grocery items extracted from the receipt.'),
});
export type AnalyzeReceiptOutput = z.infer<typeof AnalyzeReceiptOutputSchema>;

export async function analyzeReceipt(input: AnalyzeReceiptInput): Promise<AnalyzeReceiptOutput> {
  if (!input.photoDataUri && !input.text) {
    throw new Error('Either a photo or text must be provided.');
  }
  return analyzeReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeReceiptPrompt',
  input: {schema: AnalyzeReceiptInputSchema},
  output: {schema: AnalyzeReceiptOutputSchema},
  prompt: `You are an expert at reading shopping receipts. Analyze the provided receipt and extract a clean list of grocery items.

  - Ignore non-food items, quantities, prices, taxes, and any other irrelevant information.
  - Just return the names of the food items.
  - Consolidate items if they appear multiple times.
  - Clean up the item names (e.g., "ORG BANANAS" should be "Bananas").
  
  The receipt is provided as either a photo or text. Prioritize the photo if both are available.
  
  Respond in the following language: {{{language}}}

  {{#if photoDataUri}}
  Receipt Photo: {{media url=photoDataUri}}
  {{else}}
  Receipt Text:
  {{{text}}}
  {{/if}}
  `,
});

const analyzeReceiptFlow = ai.defineFlow(
  {
    name: 'analyzeReceiptFlow',
    inputSchema: AnalyzeReceiptInputSchema,
    outputSchema: AnalyzeReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
