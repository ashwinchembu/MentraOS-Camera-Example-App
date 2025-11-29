# Quick Start - Email Prescription & Report Feature

## 🚀 Quick Setup (2 minutes)

### Step 1: Add Environment Variables

Add these two lines to your `.env` file:

```bash
RESEND_API_KEY=re_your_api_key_here
OPENAI_API_KEY=sk-your_openai_key_here
```

### Step 2: Get Your API Keys

**Resend API Key:**
1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Create a free account
3. Navigate to "API Keys" in the dashboard
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

**OpenAI API Key:**
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Step 3: Start the App

```bash
npm run dev
```

## 📧 How to Use

1. **Start Recording**: Click "Start Recording" button
2. **Speak**: The app will transcribe your conversation
3. **Stop Recording**: Click "Stop Recording" when done
4. **Generate Summary**: Click "Summarize with GPT-5"
5. **Send Emails**:
   - Enter patient email in "Email Prescription" → Click "Send Prescription"
   - Enter patient email in "Email Report" → Click "Send Report"

## ⚡ What Happens

### Prescription Email
- Extracts medication names, dosages, and instructions
- Sends professional blue-themed prescription email
- Patient receives formatted prescription document

### Report Email  
- Extracts diagnosis, symptoms, treatment plan
- Sends professional green-themed medical report
- Patient receives comprehensive visit summary

## 🎨 Features

- ✅ Separate prescription and report emails
- ✅ AI-powered content extraction (GPT-4)
- ✅ Beautiful HTML email templates
- ✅ Real-time sending status
- ✅ Email validation
- ✅ Error handling with logs

## 📝 Notes

- **Free Tier**: Resend allows 100 emails/day (free)
- **Development Mode**: Using `onboarding@resend.dev` sends to verified emails only
- **Production**: Verify your domain in Resend to send to any email
- **Privacy**: Always get patient consent before sending medical info via email

## ❓ Troubleshooting

**"RESEND_API_KEY is not set"**
→ Add `RESEND_API_KEY` to your `.env` file

**"Summary is required"**  
→ Click "Summarize with GPT-5" button first

**Email not received**
→ Check spam folder or verify email in Resend dashboard (for dev mode)

## 📚 Full Documentation

For detailed information, see [EMAIL_SETUP.md](./EMAIL_SETUP.md)

