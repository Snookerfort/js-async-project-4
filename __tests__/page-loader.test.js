import nock from 'nock';
import { exec } from 'node:child_process';
import { join } from 'node:path';
import { cwd } from 'node:process';
import {
  mkdir, readFile, rm, access,
} from 'node:fs/promises';
import { promisify } from 'node:util';
import { jest } from '@jest/globals';
import { format } from 'prettier';

import pageLoader from '../src/program.js';

describe('Page loader', () => {
  const testDirectory = join(cwd(), 'temp');
  const testPagePath = join(testDirectory, 'ru-hexlet-io-courses.html');
  const fixturePagePath = join(cwd(), '__fixtures__', 'test-web-page', 'index.html');
  const fixtureImgPath = join(cwd(), '__fixtures__', 'test-web-page', 'assets', 'professions', 'nodejs.png');
  const resourceDirectory = join(testDirectory, 'ru-hexlet-io-courses_files');
  const url = new URL('courses', 'https://ru.hexlet.io');
  let scope;

  beforeEach(() => {
    jest.replaceProperty(process, 'argv', process.argv.concat('-o', testDirectory, url.href));
    scope = nock(url.origin).persist().get(url.pathname).replyWithFile(200, fixturePagePath);
    scope.get('/assets/professions/nodejs.png').replyWithFile(200, fixtureImgPath);
    scope.get('/assets/application.css').reply(200);
    scope.get('/packs/js/runtime.js').reply(200);
    return mkdir(testDirectory);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    nock.cleanAll();
    return rm(testDirectory, { recursive: true, force: true });
  });

  test('should download images to the resource folder', async () => {
    const expectedImg = join(resourceDirectory, 'ru-hexlet-io-assets-professions-nodejs.png');
    await pageLoader();
    await expect(access(expectedImg)).resolves.toBeUndefined();
    scope.done();
  });

  test('the document must be equivalent to the sample', async () => {
    const testPageResultPath = join(cwd(), '__fixtures__', 'test-web-page-output', 'index.html');
    await pageLoader();
    const resultPage = await readFile(testPageResultPath, 'utf8');
    const expectedPage = await readFile(testPagePath, 'utf8');
    const resultPageFormatted = await format(resultPage, { parser: 'html' });
    const expectedPageFormatted = await format(expectedPage, { parser: 'html' });
    await expect(expectedPageFormatted).toEqual(resultPageFormatted);
    scope.done();
  });

  test('output value should be correct', async () => {
    const { stdout } = await promisify(exec)(`page-loader -o ${testDirectory} ${url}`);
    expect(stdout.trim()).toContain(testPagePath);
  });
});
