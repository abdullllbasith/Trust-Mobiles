#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const vercelBin = join(root, 'node_modules', 'vercel', 'dist', 'vc.js');

const KEYS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'WHATSAPP_NUMBER',
  'VITE_WHATSAPP_NUMBER',
  'OPENROUTER_API_KEY',
  'NVIDIA_API_KEY',
  'AI_MODEL',
  'AI_FALLBACK_MODELS',
  'APP_URL',
  'GEMINI_API_KEY',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
];

const PRODUCTION_APP_URL = 'https://trust-mobiles.vercel.app';

function parseEnvFile(path) {
  const vars = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[trimmed.slice(0, eq).trim()] = value;
  }
  return vars;
}

function vercel(args, input) {
  return spawnSync(process.execPath, [vercelBin, ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
    input,
  });
}

function upsertEnv(name, value, environment) {
  vercel(['env', 'rm', name, environment, '--yes']);

  // Prefer stdin so special chars in Mongo URIs are not mangled.
  const args = [
    'env',
    'add',
    name,
    environment,
    '--yes',
    '--force',
    '--non-interactive',
    environment === 'development' ? '--no-sensitive' : '--sensitive',
  ];

  const result = vercel(args, value);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const succeeded =
    result.status === 0 ||
    output.includes('Added Environment Variable') ||
    output.includes('Overrode Environment Variable') ||
    output.includes('Saving');

  if (!succeeded) {
    // Fallback to --value if stdin path fails on this CLI version
    const fallback = vercel([
      'env',
      'add',
      name,
      environment,
      '--value',
      value,
      '--yes',
      '--force',
      '--non-interactive',
      environment === 'development' ? '--no-sensitive' : '--sensitive',
    ]);
    const fallbackOut = `${fallback.stdout ?? ''}${fallback.stderr ?? ''}`.trim();
    const ok =
      fallback.status === 0 ||
      fallbackOut.includes('Added Environment Variable') ||
      fallbackOut.includes('Overrode Environment Variable') ||
      fallbackOut.includes('Saving');
    if (!ok) {
      throw new Error(`Failed ${name} (${environment}): ${fallbackOut || output || `exit ${result.status}`}`);
    }
  }

  console.log(`✓ ${name} → ${environment}`);
}

if (!existsSync(envPath)) {
  console.error('Missing .env file');
  process.exit(1);
}

const vars = parseEnvFile(envPath);

for (const key of KEYS) {
  let value = vars[key];
  if (!value) {
    console.warn(`Skipping ${key}: not in .env`);
    continue;
  }

  // Production/preview must use the live site URL, not localhost.
  if (key === 'APP_URL') {
    upsertEnv(key, PRODUCTION_APP_URL, 'production');
    upsertEnv(key, value, 'development');
    continue;
  }

  upsertEnv(key, value, 'production');
  upsertEnv(key, value, 'development');
}

console.log('\nEnvironment variables synced to Vercel.');
console.log('Important: In MongoDB Atlas → Network Access, allow 0.0.0.0/0 (anywhere) so Vercel can connect.');
