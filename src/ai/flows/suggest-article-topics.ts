// This file is generated by Firebase Genkit.
'use server';

/**
 * @fileOverview A flow that suggests article topics based on trending themes in AI, web development, and social media marketing.
 *
 * - suggestArticleTopics - A function that suggests article topics.
 * - SuggestArticleTopicsInput - The input type for the suggestArticleTopics function.
 * - SuggestArticleTopicsOutput - The return type for the suggestArticleTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestArticleTopicsInputSchema = z.object({
  theme: z
    .string()
    .default(
      'AI, web development, and social media marketing'
    )
    .describe(
      'The theme to generate article topics for. Defaults to AI, web development, and social media marketing.'
    ),
  count: z.number().default(5).describe('The number of topics to generate.'),
});
export type SuggestArticleTopicsInput = z.infer<typeof SuggestArticleTopicsInputSchema>;

const SuggestArticleTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('The list of suggested article topics.'),
});
export type SuggestArticleTopicsOutput = z.infer<typeof SuggestArticleTopicsOutputSchema>;

export async function suggestArticleTopics(
  input: SuggestArticleTopicsInput
): Promise<SuggestArticleTopicsOutput> {
  return suggestArticleTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestArticleTopicsPrompt',
  input: {schema: SuggestArticleTopicsInputSchema},
  output: {schema: SuggestArticleTopicsOutputSchema},
  prompt: `You are a content creation expert. You will generate {{count}} article topics based on the following themes: {{theme}}. 

Make sure the topics are unique and non-obvious. Return the topics as a list of strings in JSON format. Do not include any other text. The topics should be engaging and relevant to current trends. Each topic should be concise, ideally less than 10 words.`,
});

const suggestArticleTopicsFlow = ai.defineFlow(
  {
    name: 'suggestArticleTopicsFlow',
    inputSchema: SuggestArticleTopicsInputSchema,
    outputSchema: SuggestArticleTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
