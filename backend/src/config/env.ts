import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),
  REDIS_TLS: z.string().transform((val) => val === 'true').default('false'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Anthropic AI / Claude
  ANTHROPIC_API_KEY: z.string(),
  CLAUDE_MODEL: z.string().default('claude-sonnet-4-5-20250929'),
  CLAUDE_MAX_TOKENS: z.string().transform(Number).default('4096'),
  CLAUDE_TEMPERATURE: z.string().transform(Number).default('1.0'),

  // AWS
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_AUTH_MAX: z.string().transform(Number).default('5'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: z.string().transform((val) => val === 'true').default('true'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
  PASSWORD_MIN_LENGTH: z.string().transform(Number).default('8'),

  // Queue
  QUEUE_CONCURRENCY: z.string().transform(Number).default('5'),
  QUEUE_MAX_RETRIES: z.string().transform(Number).default('3'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
};

export const env = parseEnv();
