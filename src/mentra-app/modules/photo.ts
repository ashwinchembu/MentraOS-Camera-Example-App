/**
 * =============================================================================
 * Photo Handling Module
 * =============================================================================
 *
 * This module contains all photo-related functionality including taking photos
 * and storing them.
 *
 * =============================================================================
 */

import { AppSession } from '@mentra/sdk';
import { broadcastPhotoToClients } from '../routes/routes';

interface StoredPhoto {
  requestId: string;
  buffer: Buffer;
  timestamp: Date;
  userId: string;
  mimeType: string;
  filename: string;
  size: number;
}

/**
 * Take a photo and store it temporarily
 */
export async function takePhoto(
  session: AppSession,
  userId: string,
  logger: any,
  photosMap: Map<string, StoredPhoto>
): Promise<void> {
  const MAX_RETRIES = 2;
  let lastError: any = null;

  // Try taking photo with retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Requesting photo for user ${userId} (attempt ${attempt}/${MAX_RETRIES})...`);
      console.log(`📸 Photo request attempt ${attempt}/${MAX_RETRIES} for user ${userId}`);
      
      // Use "small" size for faster capture/transfer (helps avoid timeouts)
      const photo = await session.camera.requestPhoto({ size: 'small' });
      logger.info(`Photo taken for user ${userId}, timestamp: ${photo.timestamp}`);

    // Store the photo in the map for API access
    const storedPhoto: StoredPhoto = {
      requestId: photo.requestId,
      buffer: photo.buffer,
      timestamp: photo.timestamp,
      userId: userId,
      mimeType: photo.mimeType,
      filename: photo.filename,
      size: photo.size
    };

    // Store photo by requestId to support multiple photos per user
    photosMap.set(photo.requestId, storedPhoto);
    logger.info(`Photo stored for user ${userId}, requestId: ${photo.requestId}`);

    // Broadcast to all SSE clients
    broadcastPhotoToClients(storedPhoto);

    // Log photo capture info
    console.log('\n========================================');
    console.log('📸 PHOTO CAPTURED');
    console.log('========================================');
    console.log(`Request ID: ${photo.requestId}`);
    console.log(`MIME Type: ${photo.mimeType}`);
    console.log(`File Size: ${photo.size} bytes`);
    console.log(`Timestamp: ${photo.timestamp}`);
    console.log('✅ Photo will be analyzed with transcription when summary is generated');
    console.log('========================================\n');

      // Success - exit the retry loop
      return;

    } catch (error: any) {
      lastError = error;
      const isTimeout = error.message?.includes('timeout') || error.message?.includes('timed out');
      
      if (isTimeout && attempt < MAX_RETRIES) {
        logger.warn(`Photo request timeout on attempt ${attempt}, retrying...`);
        console.log(`⏱️  Timeout on attempt ${attempt}/${MAX_RETRIES}, waiting before retry...`);
        // Wait a bit before retrying (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      // If it's the last attempt or not a timeout error, throw
      if (attempt === MAX_RETRIES) {
        logger.error(`Error taking photo after ${MAX_RETRIES} attempts: ${error}`);
        console.error(`❌ Photo capture failed after ${MAX_RETRIES} attempts:`, error.message);
        throw error;
      }
    }
  }
  
  // If we get here, all retries failed
  if (lastError) {
    throw lastError;
  }
}
