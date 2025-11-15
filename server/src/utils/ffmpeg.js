// ============================================
// FILE: server/src/utils/ffmpeg.js
// ============================================
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const logger = require('./logger');

// Set FFmpeg paths
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

class FFmpegProcessor {
  static async getVideoMetadata(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('FFprobe error:', err);
          return reject(err);
        }
        resolve(metadata);
      });
    });
  }

  static async generateThumbnail(inputPath, outputPath, timestamp = '00:00:01') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x240',
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('Thumbnail generation error:', err);
          reject(err);
        });
    });
  }

  static async compressVideo(inputPath, outputPath, options = {}) {
    const {
      videoBitrate = '500k',
      audioBitrate = '128k',
      size = '640x?',
      fps = 25,
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoBitrate(videoBitrate)
        .audioBitrate(audioBitrate)
        .size(size)
        .fps(fps)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('Video compression error:', err);
          reject(err);
        })
        .on('progress', (progress) => {
          logger.debug(`Processing: ${progress.percent}% done`);
        })
        .run();
    });
  }

  static async convertAudioFormat(inputPath, outputPath, format = 'mp3') {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat(format)
        .audioBitrate('128k')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('Audio conversion error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  static async getAudioDuration(filePath) {
    const metadata = await this.getVideoMetadata(filePath);
    return Math.floor(metadata.format.duration);
  }

  static async extractAudioFromVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('Audio extraction error:', err);
          reject(err);
        })
        .run();
    });
  }

  static async createWaveform(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .complexFilter([
          'showwavespic=s=640x120:colors=0099ff',
        ])
        .frames(1)
        .on('end', () => resolve(outputPath))
        .on('error', (err) => {
          logger.error('Waveform generation error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  }
}

module.exports = FFmpegProcessor;