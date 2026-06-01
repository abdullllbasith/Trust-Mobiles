import dotenv from 'dotenv';
import { existsSync } from 'fs';

// Local dev: load .env files. On Vercel, variables are injected into process.env at runtime.
for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) {
    dotenv.config({ path: file, override: false });
  }
}

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  return value?.trim() || undefined;
}

function resolveAppUrl(): string {
  const explicit = readEnv('APP_URL');
  if (explicit) return explicit.replace(/\/$/, '');

  const vercelUrl = readEnv('VERCEL_URL');
  if (vercelUrl) return `https://${vercelUrl}`;

  return 'http://localhost:3000';
}

export const env = {
  MONGODB_URI: readEnv('MONGODB_URI'),
  JWT_SECRET: readEnv('JWT_SECRET') ?? 'matrix-mobiles-super-secret-key',
  OPENAI_API_KEY: readEnv('OPENAI_API_KEY'),
  GEMINI_API_KEY: readEnv('GEMINI_API_KEY'),
  APP_URL: resolveAppUrl(),
  isVercel: readEnv('VERCEL') === '1',
  isProduction: process.env.NODE_ENV === 'production',
};

const REQUIRED_ON_VERCEL = ['MONGODB_URI', 'JWT_SECRET'] as const;

export function getMissingVercelEnvVars(): string[] {
  if (!env.isVercel) return [];

  return REQUIRED_ON_VERCEL.filter((key) => !readEnv(key));
}

export function assertVercelEnv(): void {
  const missing = getMissingVercelEnvVars();
  if (missing.length > 0) {
    throw new Error(
      `Missing required Vercel environment variables: ${missing.join(', ')}. ` +
        'Add them in Vercel → Project → Settings → Environment Variables (Production + Preview), then redeploy.'
    );
  }
}
