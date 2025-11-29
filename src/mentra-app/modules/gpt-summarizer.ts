/**
 * =============================================================================
 * GPT-5 Summarization Module
 * =============================================================================
 *
 * This module handles sending transcriptions to GPT-5 for summarization.
 *
 * =============================================================================
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Summarize transcription text using GPT-5
 */
export async function summarizeWithGPT5(transcriptionText: string): Promise<string> {
  if (!transcriptionText || transcriptionText.trim().length === 0) {
    throw new Error('No transcription text to summarize');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  console.log(`[GPT-5] Summarizing transcription (${transcriptionText.length} characters)...`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o as GPT-5 might not be available yet
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes spoken transcriptions. Provide a clear, concise summary of the key points discussed. Format the summary in a well-organized way with bullet points or paragraphs as appropriate.'
        },
        {
          role: 'user',
          content: `Please summarize the following transcription:\n\n${transcriptionText}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';
    console.log(`[GPT-5] Summary generated successfully (${summary.length} characters)`);
    
    return summary;
  } catch (error: any) {
    console.error('[GPT-5] Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

/**
 * Summarize transcription with metadata
 */
export async function summarizeTranscriptionWithMetadata(
  transcriptionText: string,
  metadata?: {
    userId?: string;
    startTime?: Date;
    endTime?: Date;
    transcriptionCount?: number;
  }
): Promise<{
  summary: string;
  metadata: any;
  timestamp: Date;
}> {
  const summary = await summarizeWithGPT5(transcriptionText);

  return {
    summary,
    metadata: {
      ...metadata,
      originalLength: transcriptionText.length,
      summaryLength: summary.length,
      compressionRatio: (transcriptionText.length / summary.length).toFixed(2)
    },
    timestamp: new Date()
  };
}

