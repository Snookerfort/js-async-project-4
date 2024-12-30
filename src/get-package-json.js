import { readFile } from 'node:fs/promises';

export default () => readFile(new URL('../package.json', import.meta.url), 'utf8')
  .then((packageJson) => JSON.parse(packageJson));
