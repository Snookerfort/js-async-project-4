import { join } from 'node:path';
import { cwd } from 'node:process';
import {
  mkdir, rm, readdir, readFile,
} from 'node:fs/promises';
import writeFile from '../src/write-file.js';

describe('Write file', () => {
  const directory = join(cwd(), 'temp');
  const fileName = 'test.txt';
  const fullPath = join(directory, fileName);

  beforeEach(() => mkdir(directory));

  afterEach(() => rm(directory, { recursive: true, force: true }));

  test('Should return full path to file', async () => {
    await expect(writeFile('Some data', fileName, directory)).resolves.toEqual(fullPath);
  });

  test('Should write file to specified directory', async () => {
    await writeFile('Some data', fileName, directory);
    await expect(readdir(directory)).resolves.toContain(fileName);
  });

  test('The written file must contain the specified data', async () => {
    const content = 'Some data';
    await writeFile(content, fileName, directory);
    await expect(readFile(fullPath, 'utf8')).resolves.toEqual(content);
  });
});
