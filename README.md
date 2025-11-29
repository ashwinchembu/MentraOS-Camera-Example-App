# Clairify - AI-Powered Medical Documentation

Clairify is an intelligent medical documentation app for MentraOS smart glasses that combines camera capture, real-time transcription, and AI-powered summarization to streamline clinical workflows.

## ✨ Features

- **📸 Photo Stream**: Capture images during medical appointments with smart glasses
- **🎤 Real-time Transcription**: Live audio transcription during consultations
- **🤖 AI Summarization**: GPT-powered analysis and summary generation
- **📧 Email Integration**: Send prescriptions and medical reports directly to patients
- **🌓 Modern UI**: Beautiful, responsive interface with dark/light mode

### Core Capabilities
- **Record Transcriptions**: Start/stop recording to capture all spoken text during appointments
- **GPT-5 Summarization**: Generate professional medical summaries with structured sections
- **Email Delivery**: Send formatted prescriptions and reports to patient emails
- **Real-time Display**: See transcriptions and photos appear live during consultations

### Install MentraOS on your phone

MentraOS install links: [mentra.glass/install](https://mentra.glass/install)

### (Easiest way to get started) Set up ngrok

1. `brew install ngrok`

2. Make an ngrok account

3. [Use ngrok to make a static address/URL](https://dashboard.ngrok.com/)

### Register your App with MentraOS

1. Navigate to [console.mentra.glass](https://console.mentra.glass/)

2. Click "Sign In", and log in with the same account you're using for MentraOS

3. Click "Create App"

4. Set a unique package name like `com.yourName.yourAppName`

5. For "Public URL", enter your Ngrok's static URL

6. In the edit app screen, add the microphone permission

### Get your App running!

1. Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended)

2. Clone or download this repository locally

3. cd into your repo, then type `npm install`

5. Set up your environment variables:
   * Create a `.env` file in the root directory
   * Edit the `.env` file with your app details:
     ```
     PORT=3000
     PACKAGE_NAME=com.yourName.clairify
     MENTRAOS_API_KEY=your_api_key_from_console
     OPENAI_API_KEY=your_openai_api_key_here
     RESEND_API_KEY=your_resend_api_key_here
     RESEND_FROM_EMAIL=your_verified_sender_email
     ```
   * Make sure the `PACKAGE_NAME` matches what you registered in the MentraOS Console
   * Get your `MENTRAOS_API_KEY` from the MentraOS Developer Console
   * Get your `OPENAI_API_KEY` from [OpenAI Platform](https://platform.openai.com/) (required for AI summarization)
   * Get your `RESEND_API_KEY` from [Resend](https://resend.com/) (required for email functionality)
   * Set `RESEND_FROM_EMAIL` to a verified sender email address in your Resend account

6. Run your app with `npm run dev`

7. To expose your app to the internet (and thus MentraOS) with ngrok, run: `ngrok http --url=<YOUR_NGROK_URL_HERE> 3000`
    * `3000` is the port. It must match what is in the app config. For example, if you entered `port: 8080`, use `8080` for ngrok instead.


### Next Steps

Check out the full documentation at [docs.mentra.glass](https://docs.mentra.glass/camera)
