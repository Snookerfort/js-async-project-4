import axios from 'axios';
import {
  access, mkdir, readdir, rmdir, writeFile,
} from 'node:fs/promises';
import { cwd } from 'node:process';
import { join } from 'node:path';
import debugFactory from 'debug';
import Listr from 'listr';
import generateName from './src/generate-name.js';
import ResourceLoader from './src/resource-loader.js';

const debug = debugFactory('page-loader');

const downloadPage = (url, pagePath) => {
  const task = axios.get(url, { responseEncoding: 'binary', responseType: 'arraybuffer' })
    .then((response) => writeFile(pagePath, response.data))
    .catch((err) => console.log(err));

  return new Listr([{ title: 'Downloading page...', task: () => task }]).run();
};

const createResourceFolder = (resourceDirPath) => {
  debug('Creating resource folder...');
  return access(resourceDirPath).catch(() => mkdir(resourceDirPath));
};

const removeEmptyResourceFolder = (resourceDirPath) => {
  debug('Removing resource folder...');
  return readdir(resourceDirPath)
    .then((f) => (f.length === 0 ? rmdir(resourceDirPath) : undefined));
};

export default (url, output = cwd()) => {
  debug('URL: ', url);
  debug('Output: ', output);
  const resourceDirName = generateName(url, '_files');
  const resourceDirPath = join(output, resourceDirName);
  const pagePath = join(output, generateName(url, '.html'));
  const resourceLoader = new ResourceLoader({
    url,
    resourceDirName,
    resourceDirPath,
    pagePath: join(output, generateName(url, '.html')),
  });

  return createResourceFolder(resourceDirPath)
    .then(() => downloadPage(url, pagePath))
    .then(() => resourceLoader.initialize())
    .then(() => resourceLoader.extractResourcesFrom('img'))
    .then(() => resourceLoader.extractResourcesFrom('link'))
    .then(() => resourceLoader.extractResourcesFrom('script'))
    .then(() => removeEmptyResourceFolder(resourceDirPath))
    .then(() => console.log(pagePath));
};
