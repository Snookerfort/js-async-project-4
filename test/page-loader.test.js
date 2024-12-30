import nock from 'nock';
import { exec } from 'node:child_process';
import { join } from 'node:path';
import { cwd } from 'node:process';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { promisify } from 'node:util';
import { jest } from '@jest/globals';

import pageLoader from '../src/page-loader.js';

describe('Page loader', () => {
  const directory = join(cwd(), 'temp');
  const url = 'https://ru.hexlet.io';

  beforeEach(() => {
    jest.replaceProperty(process, 'argv', process.argv.concat('-o', directory, url));
    return mkdir(directory);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    return rm(directory, { recursive: true, force: true });
  });

  test('Output value should be correct', async () => {
    const fullPath = join(directory, 'ru-hexlet-io.html');
    const { stdout } = await promisify(exec)(`page-loader -o ${directory} ${url}`);
    expect(stdout.trim()).toEqual(fullPath);
  });

  test('Content of page should be written', async () => {
    const content = 'Content of page should be written';
    const scope = nock(url).get('/').reply(200, content);
    const fullPath = join(directory, 'ru-hexlet-io.html');
    await pageLoader();
    await expect(readFile(fullPath, 'utf8')).resolves.toEqual(content);
    scope.done();
  });
});
