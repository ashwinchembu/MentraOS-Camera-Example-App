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
 * Summarize transcription text and images using GPT-5 (multimodal)
 */
export async function summarizeWithGPT5(
  transcriptionText: string,
  images?: Array<{ base64: string; mimeType: string }>
): Promise<string> {
  if (!transcriptionText || transcriptionText.trim().length === 0) {
    throw new Error('No transcription text to summarize');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  const imageCount = images?.length || 0;
  console.log(`[GPT-5] Summarizing transcription (${transcriptionText.length} characters) with ${imageCount} images...`);

  try {
    // Build the user message content with text and images
    const userMessageContent: any[] = [
      {
        type: 'text',
        text: `Please analyze the following doctor's appointment and provide a comprehensive medical summary.\n\n**Transcription:**\n${transcriptionText}`
      }
    ];

    // Add images if provided
    if (images && images.length > 0) {
      console.log(`[GPT-5] Including ${images.length} captured images in the analysis`);
      for (let i = 0; i < images.length; i++) {
        userMessageContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${images[i].mimeType};base64,${images[i].base64}`,
            detail: 'high'
          }
        });
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o has vision capabilities
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping to document a doctor's appointment. The doctor is wearing smart glasses that capture audio and images during the appointment. Your role is to:
1. Analyze the conversation transcription AND any captured images together
2. Identify key medical information: symptoms, diagnoses, treatment plans, medications
3. Note visual observations from images (wounds, rashes, test results, X-rays, equipment, etc.)
4. Correlate what's discussed in the conversation with what's visible in the images
5. Note any relevant patient history or concerns mentioned
6. Highlight action items or follow-up instructions
7. Organize the summary in a clear, professional medical documentation format

Format the summary with sections like:
- Chief Complaint
- Visual Observations (from images)
- Symptoms Discussed
- Assessment/Diagnosis
- Treatment Plan
- Follow-up Instructions
- Other Notes

Always maintain patient privacy and professional medical tone.`
        },
        {
          role: 'user',
          content: userMessageContent
        }
      ],
      temperature: 0.3, // Lower temperature for more factual, consistent medical documentation
      max_tokens: 2000 // Increased to handle image analysis
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
 * Summarize transcription with metadata (supports images)
 */
export async function summarizeTranscriptionWithMetadata(
  transcriptionText: string,
  images?: Array<{ base64: string; mimeType: string }>,
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
  const summary = await summarizeWithGPT5(transcriptionText, images);

  return {
    summary,
    metadata: {
      ...metadata,
      originalLength: transcriptionText.length,
      summaryLength: summary.length,
      imageCount: images?.length || 0,
      compressionRatio: (transcriptionText.length / summary.length).toFixed(2)
    },
    timestamp: new Date()
  };
}

