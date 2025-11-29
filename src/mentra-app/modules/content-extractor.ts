/**
 * =============================================================================
 * Content Extractor Module
 * =============================================================================
 *
 * This module extracts prescription and report content from medical summaries
 * using GPT-4.
 *
 * =============================================================================
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Extract prescription from medical summary
 */
export async function extractPrescription(summaryText: string): Promise<string> {
  if (!summaryText || summaryText.trim().length === 0) {
    throw new Error('No summary text to extract prescription from');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  console.log(`[Prescription Extractor] Extracting prescription from summary...`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical documentation assistant. Your task is to extract ONLY the prescription information from a medical summary. 

The prescription should include:
- Medication names
- Dosages
- Frequency of administration
- Duration of treatment
- Special instructions for taking medications
- Any warnings or precautions

Format the prescription professionally, as it would appear on an official prescription. If no prescription information is found, state "No prescription information available in this summary."

Do NOT include diagnosis, symptoms, or other medical history - ONLY the prescription details.`
        },
        {
          role: 'user',
          content: `Extract the prescription information from the following medical summary:\n\n${summaryText}`
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const prescription = completion.choices[0]?.message?.content || 'No prescription information available';
    console.log(`[Prescription Extractor] Prescription extracted successfully`);
    
    return prescription;
  } catch (error: any) {
    console.error('[Prescription Extractor] Error extracting prescription:', error);
    throw new Error(`Failed to extract prescription: ${error.message}`);
  }
}

/**
 * Extract medical report from summary
 */
export async function extractReport(summaryText: string): Promise<string> {
  if (!summaryText || summaryText.trim().length === 0) {
    throw new Error('No summary text to extract report from');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  console.log(`[Report Extractor] Extracting medical report from summary...`);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical documentation assistant. Your task is to create a comprehensive medical report from a medical summary.

The report should include:
- Chief Complaint
- Patient History (if mentioned)
- Physical Examination Findings
- Symptoms Discussed
- Assessment/Diagnosis
- Treatment Plan (general overview, NOT detailed prescription)
- Follow-up Instructions
- Recommendations
- Other Clinical Notes

Format the report professionally as a complete medical document. Focus on the clinical assessment, findings, and overall care plan.

Do NOT include detailed prescription information (medication names, dosages) - that goes in the separate prescription document.`
        },
        {
          role: 'user',
          content: `Create a comprehensive medical report from the following summary:\n\n${summaryText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    });

    const report = completion.choices[0]?.message?.content || 'No report information available';
    console.log(`[Report Extractor] Medical report extracted successfully`);
    
    return report;
  } catch (error: any) {
    console.error('[Report Extractor] Error extracting report:', error);
    throw new Error(`Failed to extract report: ${error.message}`);
  }
}

/**
 * Extract both prescription and report
 */
export async function extractBoth(summaryText: string): Promise<{
  prescription: string;
  report: string;
}> {
  const [prescription, report] = await Promise.all([
    extractPrescription(summaryText),
    extractReport(summaryText)
  ]);

  return { prescription, report };
}

