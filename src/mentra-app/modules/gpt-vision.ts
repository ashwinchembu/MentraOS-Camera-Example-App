/**
 * =============================================================================
 * GPT-5 Vision Module
 * =============================================================================
 *
 * This module handles sending images to GPT-5 for vision analysis.
 * Specifically designed for doctor's appointment use case.
 *
 * =============================================================================
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Analyze an image using GPT-5 Vision with doctor's appointment context
 */
export async function analyzeImageWithGPT5(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  if (!base64Image || base64Image.trim().length === 0) {
    throw new Error('No image data provided');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  console.log(`[GPT-5 Vision] Analyzing image (${base64Image.length} characters)...`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4o has vision capabilities
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant helping to document a doctor's appointment. The doctor is wearing smart glasses that capture images during the appointment. Your role is to:
1. Analyze the image and describe what you see in the medical context
2. Identify any relevant medical information, symptoms, or conditions visible
3. Note any medical equipment, medications, or documentation in the image
4. Provide a clear, professional description that could be useful for medical documentation
5. If the image shows a patient, describe any visible symptoms or relevant observations

Always maintain patient privacy and professional medical tone.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this image from the doctor\'s appointment and provide a detailed description of what you observe.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: 'high' // Use high detail for medical accuracy
              }
            }
          ]
        }
      ],
      temperature: 0.3, // Lower temperature for more factual, consistent responses
      max_tokens: 1500
    });

    const analysis = completion.choices[0]?.message?.content || 'No analysis generated';
    console.log(`[GPT-5 Vision] Analysis generated successfully (${analysis.length} characters)`);
    console.log('\n========================================');
    console.log('🔍 GPT-5 VISION ANALYSIS');
    console.log('========================================');
    console.log(analysis);
    console.log('========================================\n');
    
    return analysis;
  } catch (error: any) {
    console.error('[GPT-5 Vision] Error analyzing image:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}

/**
 * Analyze image with metadata
 */
export async function analyzeImageWithMetadata(
  base64Image: string,
  mimeType: string,
  metadata?: {
    userId?: string;
    timestamp?: Date;
    requestId?: string;
  }
): Promise<{
  analysis: string;
  metadata: any;
  timestamp: Date;
}> {
  const analysis = await analyzeImageWithGPT5(base64Image, mimeType);

  return {
    analysis,
    metadata: {
      ...metadata,
      imageSize: base64Image.length,
      mimeType,
      modelUsed: 'gpt-4o'
    },
    timestamp: new Date()
  };
}

