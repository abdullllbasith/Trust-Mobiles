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

const DEFAULT_AI_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
const DEFAULT_AI_FALLBACK_MODELS = [
  'openai/gpt-oss-20b:free',
  'nvidia/nemotron-3-embed-1b:free',
];

function parseModelList(raw: string | undefined, fallback: string[]): string[] {
  if (!raw?.trim()) return fallback;
  return raw
    .split(/[,|\n]/)
    .map((m) => m.trim())
    .filter(Boolean);
}

export const env = {
  MONGODB_URI: readEnv('MONGODB_URI'),
  JWT_SECRET: readEnv('JWT_SECRET') ?? 'matrix-mobiles-super-secret-key',
  /** OpenRouter key — for free Nvidia model: nvidia/nemotron-3-ultra-550b-a55b:free */
  OPENROUTER_API_KEY: readEnv('OPENROUTER_API_KEY'),
  /** NVIDIA NGC / build.nvidia.com key — for integrate.api.nvidia.com */
  NVIDIA_API_KEY: readEnv('NVIDIA_API_KEY'),
  AI_MODEL: readEnv('AI_MODEL') ?? DEFAULT_AI_MODEL,
  /** Comma-separated OpenRouter fallback models tried on rate-limit / model errors */
  AI_FALLBACK_MODELS: parseModelList(readEnv('AI_FALLBACK_MODELS'), DEFAULT_AI_FALLBACK_MODELS),
  GEMINI_API_KEY: readEnv('GEMINI_API_KEY'),
  APP_URL: resolveAppUrl(),
  isVercel: readEnv('VERCEL') === '1',
  isProduction: process.env.NODE_ENV === 'production',
};

export type AIProvider = 'openrouter' | 'nvidia';

export function resolveAIProvider(): AIProvider | null {
  const model = env.AI_MODEL;
  const wantsOpenRouter = model.includes(':free') || model.includes('openrouter');

  if (wantsOpenRouter && env.OPENROUTER_API_KEY) return 'openrouter';
  if (env.NVIDIA_API_KEY) return 'nvidia';
  if (env.OPENROUTER_API_KEY) return 'openrouter';
  return null;
}

export function resolveAIModel(provider: AIProvider): string {
  const model = env.AI_MODEL;
  if (provider === 'nvidia') {
    // NVIDIA NIM uses the slug without OpenRouter's :free suffix
    return model.replace(/:free$/i, '');
  }
  return model;
}

/** True for embedding-only models that cannot serve chat completions. */
export function isEmbeddingModel(model: string): boolean {
  return /embed/i.test(model);
}

/**
 * Ordered chat model chain: primary first, then configured fallbacks.
 * Embedding-only models are kept in env for visibility but skipped for chat.
 */
export function resolveChatModelChain(provider: AIProvider): string[] {
  const primary = resolveAIModel(provider);
  const fallbacks =
    provider === 'openrouter'
      ? env.AI_FALLBACK_MODELS
      : env.AI_FALLBACK_MODELS.map((m) => m.replace(/:free$/i, ''));

  const seen = new Set<string>();
  const chain: string[] = [];

  for (const model of [primary, ...fallbacks]) {
    const normalized = model.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    if (isEmbeddingModel(normalized)) continue;
    chain.push(normalized);
  }

  return chain.length > 0 ? chain : [primary];
}

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
