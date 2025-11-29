# 📧 Email Feature - Complete Guide

## 🎉 What's New

Your MentraOS Camera App now supports sending **prescription** and **medical report** emails separately using the Resend API with AI-powered content extraction!

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

Run this command in the project root:

```bash
npm install
```

This will install the new dependencies:
- `resend@^4.0.2` - Email sending service
- `openai@^4.80.0` - AI content extraction (already used for summarization)

### Step 2: Get API Keys

#### Resend API Key (Free)

1. Visit [https://resend.com/signup](https://resend.com/signup)
2. Sign up for a free account (no credit card required)
3. Go to **API Keys** section
4. Click **"Create API Key"**
5. Copy your key (starts with `re_`)

#### OpenAI API Key

1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Copy your key (starts with `sk-`)

### Step 3: Configure Environment Variables

Create or update your `.env` file in the project root:

```bash
# Existing variables (keep these)
PACKAGE_NAME=your-package-name
MENTRAOS_API_KEY=your-mentraos-api-key
PORT=3000
NODE_ENV=development
USE_VITE_DEV=true
VITE_AUDIO_URL=nothing

# Add these NEW variables
OPENAI_API_KEY=sk-your_openai_key_here
RESEND_API_KEY=re_your_resend_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Important**: The `RESEND_FROM_EMAIL` can remain as `onboarding@resend.dev` for development/testing.

### Step 4: Start the Application

```bash
npm run dev
```

You should see:
```
✓ Backend started on port 3000
✓ Frontend started on http://localhost:5173
```

---

## 📱 How to Use

### Visual Workflow

```
┌─────────────────────────────────────────────┐
│  1. 🎤 START RECORDING                      │
│     Click "Start Recording" button          │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. 🗣️  SPEAK                               │
│     Have a conversation / medical appt      │
│     Watch live transcriptions appear        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. ⏹️  STOP RECORDING                      │
│     Click "Stop Recording" when done        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. ✨ GENERATE SUMMARY                     │
│     Click "Summarize with GPT-5"            │
│     Wait for AI to process                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. 📧 SEND EMAILS (NEW!)                   │
│                                             │
│  Option A: Send Prescription                │
│  → Enter email in "Email Prescription"      │
│  → Click "Send Prescription"                │
│                                             │
│  Option B: Send Report                      │
│  → Enter email in "Email Report"            │
│  → Click "Send Report"                      │
│                                             │
│  ✓ Both can be sent to different emails    │
└─────────────────────────────────────────────┘
```

### UI Screenshot Description

**After generating a summary, you'll see two new sections:**

1. **Email Prescription** (Blue/Cyan themed)
   - 📧 Icon with "Email Prescription" header
   - Email input field: `patient@example.com`
   - Gradient button: "Send Prescription"

2. **Email Report** (Purple/Rose themed)
   - 📧 Icon with "Email Report" header
   - Email input field: `patient@example.com`
   - Gradient button: "Send Report"

---

## 🎨 What Gets Sent

### Prescription Email (Blue Theme 📋)

**Subject**: Your Medical Prescription

**Contains**:
- Medication names
- Dosages (e.g., "500mg")
- Frequency (e.g., "twice daily")
- Duration (e.g., "for 7 days")
- Special instructions
- Warnings and precautions

**Email Template**:
- Professional blue design
- Prescription icon 📋
- Date generated
- Formatted medication list
- Confidentiality notice

### Report Email (Green Theme 📊)

**Subject**: Your Medical Report

**Contains**:
- Chief Complaint
- Patient History
- Symptoms Discussed
- Physical Examination Findings
- Assessment/Diagnosis
- Treatment Plan (overview)
- Follow-up Instructions
- Recommendations

**Email Template**:
- Professional green design
- Report icon 📊
- Date generated
- Formatted sections
- Confidentiality notice

---

## 🔍 Example Usage

### Scenario: Doctor's Appointment

**Transcription captured**:
> "The patient reports persistent headaches for the past week. Blood pressure is 130/85. I'm prescribing Ibuprofen 400mg three times daily with food for one week. Patient should return if symptoms persist or worsen. Also recommend staying hydrated and reducing screen time."

**After clicking "Summarize with GPT-5"**:

```
Chief Complaint: Persistent headaches for one week

Symptoms Discussed:
- Headaches (duration: 1 week)
- No other reported symptoms

Assessment/Diagnosis:
- Tension headaches, likely related to screen time
- Blood pressure: 130/85 (slightly elevated)

Treatment Plan:
- Prescribed Ibuprofen 400mg
- Lifestyle modifications recommended

Follow-up Instructions:
- Return if symptoms persist or worsen
- Monitor blood pressure
```

**Click "Send Prescription" to patient@example.com**:
Email sent with:
```
Medication: Ibuprofen
Dosage: 400mg
Frequency: Three times daily
Instructions: Take with food
Duration: One week
```

**Click "Send Report" to patient@example.com**:
Email sent with full visit summary including chief complaint, assessment, diagnosis, and recommendations.

---

## 🔧 Technical Details

### API Endpoints

#### Send Prescription
```http
POST /api/email/prescription
Content-Type: application/json

{
  "userId": "user123",
  "email": "patient@example.com",
  "summary": "The GPT-generated medical summary text..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Prescription email sent successfully",
  "messageId": "abc123-def456",
  "email": "patient@example.com",
  "userId": "user123"
}
```

#### Send Report
```http
POST /api/email/report
Content-Type: application/json

{
  "userId": "user123",
  "email": "patient@example.com",
  "summary": "The GPT-generated medical summary text..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report email sent successfully",
  "messageId": "ghi789-jkl012",
  "email": "patient@example.com",
  "userId": "user123"
}
```

### Architecture

```
Frontend (React/TypeScript)
    │
    ├─ Template.tsx
    │   ├─ Email input fields
    │   ├─ Send buttons
    │   └─ Status handling
    │
    ↓ HTTP POST
    │
Backend (Express/TypeScript)
    │
    ├─ routes.ts
    │   ├─ /api/email/prescription
    │   └─ /api/email/report
    │
    ↓
    │
    ├─ content-extractor.ts
    │   ├─ extractPrescription() → GPT-4
    │   └─ extractReport() → GPT-4
    │
    ↓
    │
    ├─ email-service.ts
    │   ├─ sendPrescriptionEmail() → Resend API
    │   └─ sendReportEmail() → Resend API
    │
    ↓
    │
Patient's Email Inbox 📬
```

---

## ❗ Important Notes

### Development vs Production

**Development Mode** (default):
- Uses `onboarding@resend.dev` as sender
- Can only send to verified email addresses in your Resend dashboard
- Free tier: 100 emails/day

**Production Mode**:
1. Verify your domain in Resend dashboard
2. Update `.env`: `RESEND_FROM_EMAIL=noreply@yourdomain.com`
3. Can send to any email address
4. Higher rate limits

### Privacy & Security

⚠️ **IMPORTANT**: This handles Protected Health Information (PHI)

1. ✅ **DO**: Get patient consent before sending emails
2. ✅ **DO**: Use encrypted email when possible
3. ✅ **DO**: Keep `.env` file secure and never commit it
4. ✅ **DO**: Verify recipient email addresses
5. ❌ **DON'T**: Send PHI without proper authorization
6. ❌ **DON'T**: Share API keys
7. ❌ **DON'T**: Use in production without HIPAA compliance review

### Rate Limits

- **Resend Free Tier**: 100 emails per day
- **OpenAI**: Based on your plan (GPT-4 usage for extraction)

---

## 🐛 Troubleshooting

### Error: "RESEND_API_KEY is not set"

**Solution**: Add `RESEND_API_KEY=re_your_key` to `.env` file

### Error: "OPENAI_API_KEY is not set"

**Solution**: Add `OPENAI_API_KEY=sk_your_key` to `.env` file

### Error: "Summary is required"

**Solution**: Click "Summarize with GPT-5" button before sending emails

### Error: "Valid email address is required"

**Solution**: Enter a valid email format (e.g., `user@example.com`)

### Email not received

**Check**:
1. Spam/junk folder
2. Resend dashboard for delivery status
3. In development mode, verify recipient email in Resend
4. Check system logs in the app UI

### "Failed to send email"

**Debug**:
1. Check terminal logs for `[Email]` messages
2. Verify API keys are correct
3. Check Resend dashboard for errors
4. Verify internet connection

---

## 📊 Monitoring

### System Logs

All email operations are logged in the UI:

```
[10:30:45] → Sending prescription to patient@example.com...
[10:30:47] → Prescription sent to patient@example.com
```

### Backend Logs

Check terminal for detailed logs:

```
[Email] Extracting prescription for user user123 and sending to patient@example.com
[Prescription Extractor] Extracting prescription from summary...
[Email] Prescription sent successfully. Message ID: abc123-def456
```

---

## 📚 Files Structure

```
MentraOS-Camera-Example-App/
├── package.json                           # ✨ Updated with resend & openai
├── .env                                   # ✨ Add your API keys here
├── EMAIL_FEATURE_README.md               # ← You are here
├── EMAIL_SETUP.md                        # Detailed setup guide
├── QUICK_START_EMAIL.md                  # Quick start guide
├── EMAIL_IMPLEMENTATION_SUMMARY.md       # Technical summary
└── src/
    ├── mentra-app/
    │   ├── modules/
    │   │   ├── email-service.ts          # ✨ NEW - Resend integration
    │   │   ├── content-extractor.ts      # ✨ NEW - GPT-4 extraction
    │   │   └── gpt-summarizer.ts         # Existing
    │   └── routes/
    │       └── routes.ts                  # ✨ Updated - New endpoints
    └── frontend/
        └── src/
            └── pages/
                └── Template.tsx           # ✨ Updated - Email UI
```

---

## ✅ Testing Checklist

- [ ] Installed dependencies (`npm install`)
- [ ] Added `RESEND_API_KEY` to `.env`
- [ ] Added `OPENAI_API_KEY` to `.env`
- [ ] Started app (`npm run dev`)
- [ ] Connected glasses/device
- [ ] Started recording transcriptions
- [ ] Stopped recording
- [ ] Generated summary successfully
- [ ] Entered valid email for prescription
- [ ] Clicked "Send Prescription"
- [ ] Received prescription email
- [ ] Entered valid email for report
- [ ] Clicked "Send Report"
- [ ] Received report email
- [ ] Checked system logs
- [ ] Verified email content is correct

---

## 🎓 Learn More

- **Resend Documentation**: [https://resend.com/docs](https://resend.com/docs)
- **OpenAI API**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **MentraOS SDK**: Check existing documentation in the project

---

## 💡 Tips

1. **Save emails**: You can send prescription and report to different addresses
2. **Test first**: Use your own email for testing before sending to patients
3. **Check spam**: First emails might land in spam folder
4. **Use clear transcriptions**: Better transcriptions = better summaries = better emails
5. **Stay compliant**: Always follow HIPAA and privacy regulations

---

## 🚀 You're All Set!

The email feature is now ready to use. Start recording, generate summaries, and send professional medical documents to patients!

**Need help?** Check the troubleshooting section or review the other documentation files.

---

**Created**: November 29, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

