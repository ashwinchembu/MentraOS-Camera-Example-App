/**
 * =============================================================================
 * Transcription Storage Module
 * =============================================================================
 *
 * This module manages storing and retrieving transcriptions per user session.
 * Provides functionality to:
 * - Store final transcriptions
 * - Retrieve all transcriptions for a user
 * - Clear transcriptions
 * - Control transcription recording state
 *
 * =============================================================================
 */

interface UserTranscription {
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface UserTranscriptionSession {
  transcriptions: UserTranscription[];
  isRecording: boolean;
  startTime: Date | null;
}

// Store transcriptions per userId
const transcriptionStorage: Map<string, UserTranscriptionSession> = new Map();

/**
 * Initialize transcription storage for a user
 */
export function initializeUserTranscriptions(userId: string): void {
  if (!transcriptionStorage.has(userId)) {
    transcriptionStorage.set(userId, {
      transcriptions: [],
      isRecording: false,
      startTime: null
    });
    console.log(`[Transcription Storage] Initialized storage for user: ${userId}`);
  }
}

/**
 * Start recording transcriptions for a user
 */
export function startRecording(userId: string): void {
  // Initialize storage if it doesn't exist
  if (!transcriptionStorage.has(userId)) {
    initializeUserTranscriptions(userId);
  }
  
  const session = transcriptionStorage.get(userId);
  if (session) {
    session.isRecording = true;
    session.startTime = new Date();
    console.log(`[Transcription Storage] Started recording for user: ${userId}`);
  } else {
    console.error(`[Transcription Storage] Failed to start recording - no session for user: ${userId}`);
    throw new Error(`Unable to start recording for user: ${userId}`);
  }
}

/**
 * Stop recording transcriptions for a user
 */
export function stopRecording(userId: string): void {
  const session = transcriptionStorage.get(userId);
  if (session) {
    session.isRecording = false;
    console.log(`[Transcription Storage] Stopped recording for user: ${userId}`);
  } else {
    console.warn(`[Transcription Storage] Cannot stop recording - no session for user: ${userId}`);
  }
}

/**
 * Check if user is currently recording
 */
export function isRecording(userId: string): boolean {
  const session = transcriptionStorage.get(userId);
  return session ? session.isRecording : false;
}

/**
 * Add a transcription for a specific user (only if recording)
 */
export function addTranscription(
  userId: string,
  text: string,
  isFinal: boolean = true
): void {
  const session = transcriptionStorage.get(userId);
  
  if (!session) {
    console.warn(`[Transcription Storage] No session found for user: ${userId}`);
    return;
  }

  // Only add transcriptions if recording is active
  if (!session.isRecording) {
    console.log(`[Transcription Storage] Skipping transcription (not recording) for user: ${userId}`);
    return;
  }

  const transcription: UserTranscription = {
    text,
    timestamp: new Date(),
    isFinal
  };

  session.transcriptions.push(transcription);
  console.log(`[Transcription Storage] Added transcription for user ${userId}. Total: ${session.transcriptions.length}`);
}

/**
 * Get all transcriptions for a specific user
 */
export function getTranscriptions(userId: string): UserTranscription[] {
  const session = transcriptionStorage.get(userId);
  return session ? session.transcriptions : [];
}

/**
 * Get combined transcription text for a user
 */
export function getCombinedTranscriptionText(userId: string): string {
  const transcriptions = getTranscriptions(userId);
  return transcriptions
    .map(t => t.text)
    .join(' ')
    .trim();
}

/**
 * Clear all transcriptions for a specific user
 */
export function clearTranscriptions(userId: string): void {
  const session = transcriptionStorage.get(userId);
  if (session) {
    session.transcriptions = [];
    session.isRecording = false;
    session.startTime = null;
    console.log(`[Transcription Storage] Cleared transcriptions for user: ${userId}`);
  }
}

/**
 * Get recording status for a user
 */
export function getRecordingStatus(userId: string): {
  isRecording: boolean;
  transcriptionCount: number;
  startTime: Date | null;
} {
  const session = transcriptionStorage.get(userId);
  if (!session) {
    return {
      isRecording: false,
      transcriptionCount: 0,
      startTime: null
    };
  }

  return {
    isRecording: session.isRecording,
    transcriptionCount: session.transcriptions.length,
    startTime: session.startTime
  };
}

/**
 * Clean up transcription storage for a user (call on session end)
 */
export function cleanupUserTranscriptions(userId: string): void {
  transcriptionStorage.delete(userId);
  console.log(`[Transcription Storage] Cleaned up storage for user: ${userId}`);
}

