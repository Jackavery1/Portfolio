const { execSync } = require('node:child_process');

execSync('npm run precommit', { stdio: 'inherit' });
