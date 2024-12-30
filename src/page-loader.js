#!/usr/bin/env node
import { program } from 'commander';
import { cwd } from 'node:process';
import generatePageName from './generate-page-name.js';
import downloadPage from './download-page.js';
import getPackageJson from './get-package-json.js';
import writeFile from './write-file.js';

const command = (url, { output }) => downloadPage(url)
  .then((response) => {
    const fileName = generatePageName(url);

    return writeFile(response.data, fileName, output);
  })
  .then((filePath) => console.log(filePath))
  .catch((error) => console.error(error));

export default () => getPackageJson().then((packageJson) => {
  program
    .version(packageJson.version)
    .argument('<url>')
    .option('-o, --output [dir]', `output dir (default: "${cwd()}")`)
    .action(command);

  return program.parseAsync(process.argv);
});
