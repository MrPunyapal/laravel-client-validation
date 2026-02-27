import { execSync } from 'child_process';

process.env.BUILD_BUNDLE = 'true';
execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, BUILD_BUNDLE: 'true' } });
