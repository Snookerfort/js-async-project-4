import { join } from 'node:path';
import { cwd } from 'node:process';
import { writeFile } from 'node:fs/promises';

export default (data, name, directory = cwd()) => {
  const filePath = join(directory, name);

  return writeFile(filePath, data).then(() => filePath);
};
