// ============================================
// FILE: server/src/services/media.service.js
// ============================================
const { supabase } = require('../config/database');
const { BUCKETS } = require('../config/storage');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const FFmpegProcessor = require('../utils/ffmpeg');
const Helpers = require('../utils/helpers');

class MediaService {
  async uploadImage(file, userId, bucket = BUCKETS.MEDIA) {
    try {
      const fileId = uuidv4();
      const ext = path.extname(file.originalname);
      const fileName = `${userId}/${fileId}${ext}`;

      // Compress image
      const compressed = await sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Generate thumbnail
      const thumbnail = await sharp(file.buffer)
        .resize(320, 240, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();

      const thumbnailName = `${userId}/thumbnails/${fileId}_thumb${ext}`;

      // Upload original
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressed, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Upload thumbnail
      await supabase.storage
        .from(bucket)
        .upload(thumbnailName, thumbnail, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      // Get public URLs
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const { data: thumbData } = supabase.storage
        .from(bucket)
        .getPublicUrl(thumbnailName);

      logger.info(`Image uploaded: ${fileName}`);

      return {
        url: urlData.publicUrl,
        thumbnailUrl: thumbData.publicUrl,
        fileName,
        fileSize: compressed.length,
      };
    } catch (error) {
      logger.error('Image upload error:', error);
      throw error;
    }
  }

  async uploadVideo(file, userId, bucket = BUCKETS.MEDIA) {
    try {
      const fileId = uuidv4();
      const ext = path.extname(file.originalname);
      const fileName = `${userId}/${fileId}${ext}`;
      const tempPath = `/tmp/${fileId}${ext}`;
      const compressedPath = `/tmp/${fileId}_compressed.mp4`;
      const thumbnailPath = `/tmp/${fileId}_thumb.jpg`;

      // Save to temp
      await fs.writeFile(tempPath, file.buffer);

      // Compress video
      await FFmpegProcessor.compressVideo(tempPath, compressedPath, {
        videoBitrate: '500k',
        audioBitrate: '128k',
        size: '640x?',
      });

      // Generate thumbnail
      await FFmpegProcessor.generateThumbnail(tempPath, thumbnailPath);

      // Read compressed files
      const compressedBuffer = await fs.readFile(compressedPath);
      const thumbnailBuffer = await fs.readFile(thumbnailPath);

      // Upload video
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Upload thumbnail
      const thumbnailName = `${userId}/thumbnails/${fileId}_thumb.jpg`;
      await supabase.storage
        .from(bucket)
        .upload(thumbnailName, thumbnailBuffer, {
          contentType: 'image/jpeg',
        });

      // Cleanup temp files
      await Promise.all([
        fs.unlink(tempPath),
        fs.unlink(compressedPath),
        fs.unlink(thumbnailPath),
      ]);

      // Get URLs
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      const { data: thumbData } = supabase.storage
        .from(bucket)
        .getPublicUrl(thumbnailName);

      // Get duration
      const metadata = await FFmpegProcessor.getVideoMetadata(tempPath);
      const duration = Math.floor(metadata.format.duration);

      logger.info(`Video uploaded: ${fileName}`);

      return {
        url: urlData.publicUrl,
        thumbnailUrl: thumbData.publicUrl,
        fileName,
        fileSize: compressedBuffer.length,
        duration,
      };
    } catch (error) {
      logger.error('Video upload error:', error);
      throw error;
    }
  }

  async uploadAudio(file, userId, bucket = BUCKETS.MEDIA) {
    try {
      const fileId = uuidv4();
      const fileName = `${userId}/audio/${fileId}.mp3`;

      // Upload audio
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
        });

      if (error) throw error;

      // Get URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      logger.info(`Audio uploaded: ${fileName}`);

      return {
        url: urlData.publicUrl,
        fileName,
        fileSize: file.size,
      };
    } catch (error) {
      logger.error('Audio upload error:', error);
      throw error;
    }
  }

  async deleteFile(fileName, bucket = BUCKETS.MEDIA) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;
      logger.info(`File deleted: ${fileName}`);
      return true;
    } catch (error) {
      logger.error('File deletion error:', error);
      return false;
    }
  }
}

module.exports = new MediaService();