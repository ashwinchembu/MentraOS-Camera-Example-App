# Email Setup Guide - Prescription & Report Sending

This application now supports sending prescriptions and medical reports via email using the Resend API.

## Features

- ✅ Separate email sending for prescriptions and reports
- ✅ AI-powered content extraction using GPT-4
- ✅ Professional HTML email templates
- ✅ Real-time email status updates
- ✅ User-friendly email input interface

## Setup Instructions

### 1. Get Resend API Key

1. Sign up for a free account at [https://resend.com](https://resend.com)
2. Navigate to the API Keys section in your dashboard
3. Create a new API key
4. Copy the API key (starts with `re_`)

### 2. Configure Environment Variables

Add the following variables to your `.env` file in the project root:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # or your verified domain

# OpenAI API Key (required for content extraction)
OPENAI_API_KEY=sk-your-openai-key-here
```

**Important Notes:**

- For production use, verify your own domain in Resend and update `RESEND_FROM_EMAIL`
- The free tier of Resend allows 100 emails per day
- You need an OpenAI API key for GPT-4 to extract prescription and report content

### 3. Verify Domain (Optional for Production)

For production use with your own domain:

1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add the provided DNS records to your domain provider
4. Wait for verification
5. Update `RESEND_FROM_EMAIL` in `.env` to use your domain (e.g., `noreply@yourdomain.com`)

## How It Works

### Workflow

1. **Record Transcriptions**: Start recording during a medical appointment
2. **Generate Summary**: Use the "Summarize with GPT-5" button to create a comprehensive medical summary
3. **Send Emails**: 
   - Enter patient email in the "Email Prescription" field and click "Send Prescription"
   - Enter patient email in the "Email Report" field and click "Send Report"

### Behind the Scenes

1. **Prescription Email**:
   - GPT-4 extracts medication names, dosages, frequency, and instructions
   - Formats as a professional prescription document
   - Sends via Resend with a blue-themed HTML template

2. **Report Email**:
   - GPT-4 extracts chief complaint, symptoms, diagnosis, treatment plan
   - Formats as a comprehensive medical report
   - Sends via Resend with a green-themed HTML template

## API Endpoints

### POST `/api/email/prescription`

Send prescription email

**Request Body:**
```json
{
  "userId": "user-id",
  "email": "patient@example.com",
  "summary": "The GPT-generated medical summary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription email sent successfully",
  "messageId": "resend-message-id",
  "email": "patient@example.com",
  "userId": "user-id"
}
```

### POST `/api/email/report`

Send report email

**Request Body:**
```json
{
  "userId": "user-id",
  "email": "patient@example.com",
  "summary": "The GPT-generated medical summary"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report email sent successfully",
  "messageId": "resend-message-id",
  "email": "patient@example.com",
  "userId": "user-id"
}
```

## Email Templates

Both email types feature:
- Responsive HTML design
- Professional medical styling
- Clear headers and sections
- Confidentiality notices
- Document IDs for tracking

**Prescription Email:**
- Blue-themed design with 📋 icon
- Focused on medication details
- Includes dosage and administration instructions

**Report Email:**
- Green-themed design with 📊 icon
- Comprehensive medical documentation
- Includes diagnosis, treatment plan, and follow-up

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly in `.env`
2. **Check OpenAI Key**: Ensure `OPENAI_API_KEY` is set (required for content extraction)
3. **Verify Email Format**: Make sure the recipient email is valid
4. **Check Logs**: Look in the terminal for error messages starting with `[Email]`
5. **Rate Limits**: Free tier allows 100 emails/day

### Content Extraction Issues

1. **Generate Summary First**: You must generate a summary before sending emails
2. **Check Summary Content**: Ensure the summary contains medical information
3. **OpenAI Credits**: Verify your OpenAI account has available credits

### Common Errors

- `RESEND_API_KEY is not set`: Add the API key to your `.env` file
- `Valid email address is required`: Check email format
- `Summary is required`: Generate a summary first using the "Summarize with GPT-5" button

## Security Best Practices

1. **Never commit** your `.env` file to version control
2. **Use environment variables** for all sensitive credentials
3. **Verify domains** in production to prevent spoofing
4. **HIPAA Compliance**: Ensure you have proper authorization and encryption for PHI (Protected Health Information)
5. **Patient Consent**: Always obtain patient consent before sending medical information via email

## Development vs Production

### Development (onboarding@resend.dev)
- Can only send to verified email addresses in your Resend account
- Good for testing
- Free tier: 100 emails/day

### Production (your verified domain)
- Can send to any email address
- Requires domain verification
- Higher rate limits available on paid plans

## File Structure

```
src/mentra-app/
├── modules/
│   ├── email-service.ts          # Resend integration & email templates
│   ├── content-extractor.ts      # GPT-4 content extraction
│   └── gpt-summarizer.ts         # GPT-4 summarization
└── routes/
    └── routes.ts                  # Email API endpoints

src/frontend/src/pages/
└── Template.tsx                   # UI with email input fields
```

## Support

For issues related to:
- **Resend**: Visit [Resend Documentation](https://resend.com/docs)
- **OpenAI**: Visit [OpenAI Documentation](https://platform.openai.com/docs)
- **This Application**: Check the system logs in the UI or terminal output

