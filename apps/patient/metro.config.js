const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch workspace packages + root node_modules
config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Block non-RN code from being resolved
config.resolver.blockList = [
  /apps\/provider\/.*/,
  /supabase\/functions\/.*/,
  /fastapi\/.*/,
  /packages\/ai\/.*/,
];

// Prevent Metro FallbackWatcher from crashing on transient pnpm temp files
config.watcher = {
  ...config.watcher,
  additionalExclusions: [
    '**/node_modules/.pnpm/**',
    '**/apps/provider/**',
  ],
};

module.exports = config;
