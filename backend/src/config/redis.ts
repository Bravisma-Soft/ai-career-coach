import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

export const createRedisClient = (): Redis => {
  const redisClient = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis client connected');
  });

  redisClient.on('ready', () => {
    logger.info('✅ Redis client ready');
  });

  redisClient.on('error', (error) => {
    logger.error('❌ Redis client error:', error);
  });

  redisClient.on('close', () => {
    logger.warn('⚠️  Redis client connection closed');
  });

  redisClient.on('reconnecting', () => {
    logger.info('🔄 Redis client reconnecting...');
  });

  return redisClient;
};

export let redis: Redis;

export const initializeRedis = (): Redis => {
  if (!redis) {
    redis = createRedisClient();
  }
  return redis;
};

export const closeRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    logger.info('✅ Redis connection closed');
  }
};
