#!/usr/bin/env node
import { Command } from 'commander';
import { cwd } from 'node:process';
import pageLoader from '../index.js';
import getPackageJson from '../src/get-package-json.js';

const program = () => getPackageJson().then((packageJson) => {
  const command = new Command()
    .version(packageJson.version)
    .argument('<url>')
    .option('-o, --output [dir]', `output dir (default: "${cwd()}")`, cwd())
    .action((url, { output }) => pageLoader(url, output));

  return command.parseAsync(process.argv);
});

program();

export default program;
