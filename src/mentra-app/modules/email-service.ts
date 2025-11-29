/**
 * =============================================================================
 * Email Service Module (Resend)
 * =============================================================================
 *
 * This module handles sending emails using Resend API for:
 * - Prescription emails
 * - Medical report emails
 *
 * =============================================================================
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  content: string;
  userId?: string;
}

/**
 * Send a prescription email
 */
export async function sendPrescriptionEmail(
  recipientEmail: string,
  prescriptionContent: string,
  userId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in environment variables');
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new Error('Valid recipient email is required');
    }

    console.log(`[Email] Sending prescription to: ${recipientEmail}`);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: 'Your Medical Prescription',
      html: generatePrescriptionHTML(prescriptionContent, userId),
    });

    if (error) {
      console.error('[Email] Error sending prescription:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Prescription sent successfully. Message ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[Email] Failed to send prescription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a medical report email
 */
export async function sendReportEmail(
  recipientEmail: string,
  reportContent: string,
  userId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in environment variables');
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      throw new Error('Valid recipient email is required');
    }

    console.log(`[Email] Sending report to: ${recipientEmail}`);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: 'Your Medical Report',
      html: generateReportHTML(reportContent, userId),
    });

    if (error) {
      console.error('[Email] Error sending report:', error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Report sent successfully. Message ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('[Email] Failed to send report:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate HTML for prescription email
 */
function generatePrescriptionHTML(prescriptionContent: string, userId?: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Prescription</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #4a90e2;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4a90e2;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header .subtitle {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    .content {
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.8;
      color: #444;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background-color: #4a90e2;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">PRESCRIPTION</div>
      <h1>📋 Medical Prescription</h1>
      <p class="subtitle">Generated on ${currentDate}</p>
    </div>
    <div class="content">${prescriptionContent.replace(/\n/g, '<br>')}</div>
    <div class="footer">
      <p><strong>Important:</strong> This prescription was generated using AI-assisted documentation during your medical appointment.</p>
      <p>Please follow your healthcare provider's instructions carefully.</p>
      ${userId ? `<p style="font-size: 10px; color: #aaa;">Document ID: ${userId}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate HTML for medical report email
 */
function generateReportHTML(reportContent: string, userId?: string): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Report</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 650px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #10b981;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #10b981;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header .subtitle {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    .content {
      white-space: pre-wrap;
      font-size: 15px;
      line-height: 1.8;
      color: #444;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #888;
      text-align: center;
    }
    .badge {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">MEDICAL REPORT</div>
      <h1>📊 Medical Report Summary</h1>
      <p class="subtitle">Generated on ${currentDate}</p>
    </div>
    <div class="content">${reportContent.replace(/\n/g, '<br>')}</div>
    <div class="footer">
      <p><strong>Confidential:</strong> This report contains sensitive medical information.</p>
      <p>Generated using AI-assisted documentation during your medical appointment.</p>
      ${userId ? `<p style="font-size: 10px; color: #aaa;">Document ID: ${userId}</p>` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

