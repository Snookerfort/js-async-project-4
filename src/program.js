#!/usr/bin/env node
import { Command } from 'commander';
import { cwd } from 'node:process';
import getPackageJson from './get-package-json.js';
import PageLoader from './page-loader.js';

export default () => getPackageJson().then((packageJson) => {
  const program = new Command()
    .version(packageJson.version)
    .argument('<url>')
    .option('-o, --output [dir]', `output dir (default: "${cwd()}")`, cwd())
    .action((url, { output }) => {
      const loader = new PageLoader({ url, output });
      return loader.download();
    });

  return program.parseAsync(process.argv);
});
