# Transcription Recording & GPT-5 Summarization Features

This document describes the new transcription recording and AI summarization features added to the MentraOS Camera Example App.

## Overview

The app now includes functionality to:
1. **Record transcriptions** - Start/stop recording to accumulate all spoken text
2. **Store transcriptions** - All final transcriptions are stored per user session
3. **Generate summaries** - Send accumulated transcriptions to GPT-5 for intelligent summarization
4. **Manage transcriptions** - Clear and reset transcription history

## Setup

### Environment Variables

Add your OpenAI API key to your `.env` file:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Dependencies

The following new dependency has been added:
- `openai` - For GPT-5 API integration

Run `npm install` to install the new dependency.

## Features

### 1. Transcription Recording

**Start Recording**
- Click the "Start Recording" button to begin accumulating transcriptions
- The button will turn red and show "LIVE" indicator
- All final transcriptions will be stored while recording is active

**Stop Recording**
- Click the "Stop Recording" button to stop accumulating transcriptions
- The count of recorded transcriptions will be displayed

### 2. GPT-5 Summarization

**Generate Summary**
- After stopping recording (or anytime you have recorded transcriptions)
- Click "Summarize with GPT-5" button
- The system will:
  1. Combine all recorded transcriptions into a single text
  2. Send to GPT-5 API for intelligent summarization
  3. Display the summary below the controls

**Summary Display**
- The summary appears in a formatted card below the control buttons
- Shows a clear, concise summary of all spoken content
- Includes key points and organized structure

### 3. Manage Transcriptions

**Clear Transcriptions**
- Click the "Clear" button (trash icon) to remove all stored transcriptions
- This also clears the summary
- Recording count resets to 0

## API Endpoints

The following new API endpoints have been added:

### POST `/api/transcription/start`
Start recording transcriptions for a user.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transcription recording started",
  "userId": "user_123",
  "status": {
    "isRecording": true,
    "transcriptionCount": 0,
    "startTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST `/api/transcription/stop`
Stop recording transcriptions for a user.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transcription recording stopped",
  "userId": "user_123",
  "status": {
    "isRecording": false,
    "transcriptionCount": 5,
    "startTime": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET `/api/transcription/status`
Get current recording status for a user.

**Query Parameters:**
- `userId`: User ID

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "isRecording": true,
  "transcriptionCount": 3,
  "startTime": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/transcription/all`
Get all recorded transcriptions for a user.

**Query Parameters:**
- `userId`: User ID

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "transcriptions": [
    {
      "text": "Hello world",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "isFinal": true
    },
    {
      "text": "This is a test",
      "timestamp": "2024-01-01T00:00:05.000Z",
      "isFinal": true
    }
  ],
  "combinedText": "Hello world This is a test",
  "count": 2
}
```

### POST `/api/transcription/summarize`
Generate GPT-5 summary of all recorded transcriptions.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user_123",
  "summary": "The conversation covered two main points: a greeting and a testing statement.",
  "transcriptionCount": 2,
  "originalLength": 26,
  "summaryLength": 87
}
```

### POST `/api/transcription/clear`
Clear all recorded transcriptions for a user.

**Request Body:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transcriptions cleared",
  "userId": "user_123"
}
```

## Architecture

### Backend Modules

**`transcription-storage.ts`**
- Manages storing and retrieving transcriptions per user
- Tracks recording state
- Provides combined transcription text

**`gpt-summarizer.ts`**
- Integrates with OpenAI API
- Sends transcriptions to GPT-4o/GPT-5 for summarization
- Returns formatted summaries

**`routes.ts`** (updated)
- Added 6 new API endpoints for transcription management
- Handles recording control and summarization requests

**`index.ts`** (updated)
- Initializes transcription storage for each user session
- Stores final transcriptions automatically
- Cleans up storage when session ends

### Frontend Components

**`Template.tsx`** (updated)
- Added transcription control buttons
- Added recording status indicators
- Added summary display card
- Status polling every 2 seconds
- Real-time recording count display

## Usage Example

1. **Start the app** with `npm run dev`
2. **Connect glasses** and open the app
3. **Click "Start Recording"** in the web interface
4. **Speak into the glasses** - transcriptions will appear in real-time
5. **Continue speaking** - all final transcriptions are accumulated
6. **Click "Stop Recording"** when done
7. **Click "Summarize with GPT-5"** to generate a summary
8. **View the summary** displayed below the controls
9. **Click "Clear"** to reset and start over

## Notes

- Transcriptions are only stored while recording is active
- Each user has their own isolated transcription storage
- Storage is cleared when the session ends
- The system uses GPT-4o model (configurable in `gpt-summarizer.ts`)
- Real-time transcription display continues to work independently
- Recording state persists across page refreshes via status polling

## Troubleshooting

**No transcriptions being recorded:**
- Make sure you clicked "Start Recording"
- Check that the glasses are properly connected
- Verify microphone permissions

**Summary generation fails:**
- Ensure `OPENAI_API_KEY` is set in `.env`
- Check that you have recorded transcriptions (count > 0)
- Verify OpenAI API key is valid and has credits

**Recording state not updating:**
- Check browser console for errors
- Verify the backend is running
- Check that status polling is working (every 2 seconds)

