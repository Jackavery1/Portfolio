const { execSync } = require('node:child_process');

execSync('git config core.hooksPath .githooks', { stdio: 'inherit' });
console.log('Hooks Git installés : .githooks/pre-commit → npm run precommit');
