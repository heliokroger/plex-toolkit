import { readdirSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import mustache from 'mustache';
import {
  extractYearFromDate,
  removeReleaseYear,
  removeSpecialCharacters,
  extractTmdbId,
  removeTmdbId,
  compareStrings,
  extractFolders,
  extractVideoFiles,
  removeDotFiles,
  renameFile,
  getState,
  updateState,
  getConfig,
  normalizeName,
} from './utils';
import { searchMovie } from './services';
import type { Movie } from './types';

const config = getConfig();

const { folder: folderFormatting, file: fileFormatting } =
  config['file-formatting']?.movies || {};

const moviesDir = config['directories']?.movies;

const ignoredMovies = config.ignore?.movies ?? [];

const scanMovies = (movies: Movie[]): Promise<(Movie | null)[]> => {
  const folders = extractFolders(
    moviesDir!,
    removeDotFiles(readdirSync(moviesDir!))
  );

  return Promise.all(
    folders.map(async (folder) => {
      if (ignoredMovies.some((movie) => movie === folder)) {
        console.log(chalk.yellow(`Media "${folder}" has been ignored.`));
        return null;
      }

      const isFolderLocked = movies.some((movie) =>
        compareStrings(movie.folder.next, folder)
      );

      const files = readdirSync(path.resolve(moviesDir!, folder));
      const [file] = extractVideoFiles(removeDotFiles(files));

      const isFileLocked = movies.some((movie) =>
        compareStrings(movie.file.next, file)
      );

      if (isFolderLocked && isFileLocked) {
        console.log(chalk.grey(`Media "${folder}" is up-to-date.`));
        return null;
      }

      const tmdbId = extractTmdbId(folder);
      const formattedName = removeReleaseYear(removeTmdbId(folder));

      const movie = await searchMovie(tmdbId, formattedName);

      if (!movie) {
        console.log(chalk.redBright(`Media "${folder}" not found.`));
        return null;
      }

      if (!file) {
        console.log(
          chalk.redBright(`Folder "${folder}" does not contain a video file.`)
        );
        return null;
      }

      const view = {
        title: removeSpecialCharacters(movie.title!),
        releaseYear: extractYearFromDate(movie.release_date!),
        tmdbId: movie.id,
        ext: path.extname(file),
      };

      return {
        folder: {
          previous: folder,
          next: normalizeName(mustache.render(folderFormatting!, view)),
        },
        file: {
          previous: file,
          next: normalizeName(mustache.render(fileFormatting!, view)),
        },
      };
    })
  );
};

const renameMovies = async () => {
  const { movies } = getState();
  const scannedMovies = (await scanMovies(movies)).filter(
    (movie) => movie
  ) as Movie[];

  scannedMovies.forEach((movie) => {
    renameFile(moviesDir!, movie.folder);
    renameFile(path.resolve(moviesDir!, movie.folder.next), movie.file);
  });

  updateState({ movies: [...movies, ...scannedMovies] });
};

renameMovies();
