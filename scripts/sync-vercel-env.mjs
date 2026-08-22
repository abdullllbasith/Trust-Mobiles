#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');
const vercelBin = join(root, 'node_modules', 'vercel', 'dist', 'vc.js');
const KEYS = ['MONGODB_URI', 'JWT_SECRET', 'OPENROUTER_API_KEY', 'NVIDIA_API_KEY', 'AI_MODEL', 'AI_FALLBACK_MODELS'];
const ENVIRONMENTS = ['production', 'development'];

function parseEnvFile(path) {
  const vars = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

function vercel(args) {
  return spawnSync(process.execPath, [vercelBin, ...args], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
}

function upsertEnv(name, value, environment) {
  vercel(['env', 'rm', name, environment, '--yes']);

  const args = [
    'env',
    'add',
    name,
    environment,
    '--value',
    value,
    '--yes',
    '--force',
    '--non-interactive',
  ];

  if (environment !== 'development') {
    args.push('--sensitive');
  } else {
    args.push('--no-sensitive');
  }

  const result = vercel(args);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  const succeeded =
    output.includes('Added Environment Variable') ||
    output.includes('Overrode Environment Variable') ||
    output.includes('Saving');

  if (!succeeded && result.status !== 0) {
    throw new Error(`Failed ${name} (${environment}): ${output || `exit ${result.status}`}`);
  }
  console.log(`✓ ${name} → ${environment}`);
}

if (!existsSync(envPath)) {
  console.error('Missing .env file');
  process.exit(1);
}

const vars = parseEnvFile(envPath);

for (const key of KEYS) {
  const value = vars[key];
  if (!value) {
    console.warn(`Skipping ${key}: not in .env`);
    continue;
  }
  for (const environment of ENVIRONMENTS) {
    upsertEnv(key, value, environment);
  }
}

console.log('\nEnvironment variables synced to Vercel.');
