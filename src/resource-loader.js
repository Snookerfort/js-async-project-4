import { readFile, writeFile } from 'node:fs/promises';
import { loadBuffer } from 'cheerio';
import { join, parse } from 'node:path';
import axios from 'axios';
import debugFactory from 'debug';
import Listr from 'listr';
import generateName from './generate-name.js';
import getResourceAttributeName from './get-resource-attribute-name.js';

const debug = debugFactory('page-loader');

export default class {
  constructor(options) {
    this.pagePath = options.pagePath;
    this.resourceDirPath = options.resourceDirPath;
    this.url = new URL(options.url);
    this.resourceDirName = options.resourceDirName;
  }

  initialize() {
    debug('Parsing the loaded page...');
    return readFile(this.pagePath).then((buffer) => {
      this.$ = loadBuffer(buffer);
      this.$('meta[charset]').attr('charset', 'utf-8');
    });
  }

  extractResourcesFrom(tagName) {
    const resourceSrcList = [];
    this.$(tagName).each((index, el) => {
      const currentEl = this.$(el);
      const attrName = getResourceAttributeName(tagName);
      const resourceSrc = currentEl.attr(attrName);
      const { origin } = this.url;
      if (!resourceSrc || (URL.canParse(resourceSrc) && new URL(resourceSrc).origin !== origin)) {
        return;
      }
      const url = URL.canParse(resourceSrc) ? resourceSrc : new URL(resourceSrc, origin).href;
      const { dir, ext, name } = parse(url);
      const fileName = generateName(join(dir, name), ext || '.html');
      const resourceData = {
        url,
        path: join(this.resourceDirPath, fileName),
      };
      resourceSrcList.push(resourceData);
      currentEl.attr(attrName, `${this.resourceDirName}/${fileName}`);
    });

    const requests = resourceSrcList.map(({ url }) => axios.get(url, {
      responseEncoding: 'binary',
      responseType: 'arraybuffer',
    }));

    debug('Downloading resources from <%s> tags...', tagName);

    const task = Promise.all(requests)
      .then((responses) => responses.map(({ data }, index) => ({
        ...resourceSrcList[index],
        file: data,
      })))
      .then((responses) => {
        const writingTasks = responses.map(({ file, path }) => writeFile(path, file));

        return Promise.all(writingTasks);
      })
      .then(() => {
        debug('Overwriting a loaded page with local links...');
        return writeFile(this.pagePath, this.$.html());
      });

    return new Listr([{ title: `Downloading resources from ${tagName} tags...`, task: () => task }]).run();
  }
}
