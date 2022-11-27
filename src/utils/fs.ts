import { renameSync, statSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import mime from 'mime-types';
import type { FileName } from '../types';

export const removeDotFiles = (files: string[]) =>
  files.filter((file) => !file.startsWith('.'));

export const extractVideoFiles = (files: string[]) =>
  files.filter((file) => {
    const mimeType = mime.lookup(file);
    return mimeType && mimeType.startsWith('video');
  });

export const extractSubtitleFiles = (files: string[]) =>
  files.filter((file) => {
    const mimeType = mime.lookup(file);
    return mimeType === 'application/x-subrip';
  });

export const renameFile = (basePath: string, file: FileName) => {
  const { previous, next } = file;

  renameSync(path.resolve(basePath, previous), path.resolve(basePath, next));

  console.log(chalk.greenBright(`Updated media "${next}".`));
};

export const extractFolders = (basePath: string, files: string[]) =>
  files.filter((file) => statSync(path.resolve(basePath, file)).isDirectory());
