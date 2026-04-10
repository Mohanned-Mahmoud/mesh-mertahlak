#!/usr/bin/env node

/**
 * Deploy both frontend and backend to Render using render-deploy CLI
 * 
 * Prerequisites:
 * 1. Install Render CLI: npm install -g render-cli-v2
 * 2. Authenticate: render login
 * 3. Set environment variables in Render dashboard or via CLI
 * 
 * Usage:
 *   node scripts/deploy-render.mjs [frontend|backend|all]
 * 
 * Examples:
 *   node scripts/deploy-render.mjs frontend  # Deploy only frontend
 *   node scripts/deploy-render.mjs backend   # Deploy only backend
 *   node scripts/deploy-render.mjs all       # Deploy both (default)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const target = process.argv[2] || 'all';
const validTargets = ['frontend', 'backend', 'all'];

if (!validTargets.includes(target)) {
  console.error(`❌ Invalid target: ${target}`);
  console.error(`   Valid options: ${validTargets.join(', ')}`);
  process.exit(1);
}

function run(command, description) {
  try {
    console.log(`\n🚀 ${description}`);
    console.log(`   Command: ${command}\n`);
    const output = execSync(command, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32' ? true : undefined,
    });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    if (error.message) {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  }
}

console.log('\n📦 Render Deployment Script');
console.log('===========================\n');

// Check if render CLI is installed
try {
  execSync('render --version', { stdio: 'pipe' });
} catch {
  console.error('❌ Render CLI not found. Install it with:');
  console.error('   npm install -g render-cli-v2');
  console.error('   Then authenticate with: render login');
  process.exit(1);
}

// Deploy frontend
if (target === 'frontend' || target === 'all') {
  run(
    'render deploy --service mesh-mertahlak',
    'Deploying frontend to Render'
  );
}

// Deploy backend
if (target === 'backend' || target === 'all') {
  run(
    'render deploy --service mesh-mertahlak-api',
    'Deploying backend API to Render'
  );
}

console.log('\n\n✨ Deployment complete!');
console.log('===========================');
console.log('\n📍 Access your services:');
console.log('   Frontend: https://mesh-mertahlak.onrender.com');
console.log('   Backend:  https://mesh-mertahlak-api.onrender.com/api');
console.log('   Socket.IO: https://mesh-mertahlak-api.onrender.com');

console.log('\n💡 Next steps:');
console.log('   1. Verify environment variables are set in Render dashboard');
console.log('   2. For backend: Set DATABASE_URL to your Neon PostgreSQL connection string');
console.log('   3. For frontend: Set VITE_API_BASE_URL and VITE_SOCKET_URL if different from defaults');
console.log('\n');
