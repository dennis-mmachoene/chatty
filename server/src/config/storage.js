const { supabase } = require('./database');
const logger = require('../utils/logger');

const BUCKETS = {
  MEDIA: process.env.STORAGE_BUCKET_MEDIA || 'chat-media',
  AVATARS: process.env.STORAGE_BUCKET_AVATARS || 'avatars',
  STATUSES: process.env.STORAGE_BUCKET_STATUSES || 'statuses',
};

// Ensure buckets exist
const initializeBuckets = async () => {
  try {
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const existingBucketNames = existingBuckets.map((b) => b.name);

    for (const [key, bucketName] of Object.entries(BUCKETS)) {
      if (!existingBucketNames.includes(bucketName)) {
        const { error } = await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 52428800, // 50MB
        });

        if (error) {
          logger.error(`Failed to create bucket ${bucketName}:`, error);
        } else {
          logger.info(`Bucket ${bucketName} created successfully`);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to initialize storage buckets:', error);
  }
};

module.exports = {
  BUCKETS,
  initializeBuckets,
};