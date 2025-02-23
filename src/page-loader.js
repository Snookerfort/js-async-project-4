import axios from 'axios';
import {
  access, mkdir, readdir, rmdir, writeFile,
} from 'node:fs/promises';
import { cwd } from 'node:process';
import { join } from 'node:path';
import debugFactory from 'debug';
import Listr from 'listr';
import generateName from './generate-name.js';
import ResourceLoader from './resource-loader.js';

const debug = debugFactory('page-loader');

export default class {
  constructor({ url, output }) {
    this.url = url;
    this.output = output ?? cwd();
    this.pagePath = join(this.output, generateName(url, '.html'));
    const resourceDirName = generateName(url, '_files');
    this.resourceDirPath = join(output, resourceDirName);
    this.resourceLoader = new ResourceLoader({
      url: this.url,
      resourceDirName,
      pagePath: this.pagePath,
      resourceDirPath: this.resourceDirPath,
    });
  }

  download() {
    return this.createResourceFolder()
      .then(() => this.downloadPage())
      .then(() => this.resourceLoader.initialize())
      .then(() => this.resourceLoader.extractResourcesFrom('img'))
      .then(() => this.resourceLoader.extractResourcesFrom('link'))
      .then(() => this.resourceLoader.extractResourcesFrom('script'))
      .then(() => this.removeEmptyResourceFolder())
      .then(() => console.log(this.pagePath));
  }

  downloadPage() {
    const task = axios.get(this.url, { responseEncoding: 'binary', responseType: 'arraybuffer' })
      .then((response) => writeFile(this.pagePath, response.data))
      .catch((err) => console.log(err));

    return new Listr([{ title: 'Downloading page...', task: () => task }]).run();
  }

  createResourceFolder() {
    debug('Creating resource folder...');
    return access(this.resourceDirPath).catch(() => mkdir(this.resourceDirPath));
  }

  removeEmptyResourceFolder() {
    debug('Removing resource folder...');
    return readdir(this.resourceDirPath)
      .then((f) => (f.length === 0 ? rmdir(this.resourceDirPath) : undefined));
  }
}
