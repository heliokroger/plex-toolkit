import { readdirSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import mustache from 'mustache';
import {
  extractYearFromDate,
  removeReleaseYear,
  removeSpecialCharacters,
  zerofill,
  extractTmdbId,
  removeTmdbId,
  extractSeasonNumber,
  extractEpisodes,
  extractFolders,
  extractVideoFiles,
  extractSubtitleFiles,
  removeDotFiles,
  renameFile,
  getState,
  updateState,
  normalizeName,
  getConfig,
} from './utils';
import { getShowSeason, searchShow } from './services';
import type { FileName, Show } from './types';

const config = getConfig();

const episodeSubtitleFormatting = config['file-formatting']?.subtitles?.episode;

const {
  folder: folderFormatting,
  episode: episodeFormatting,
  'multiple-episodes': multipleEpisodesFormatting,
  season: seasonFormatting,
} = config['file-formatting']?.shows!;

const showsDir = config['directories']?.shows;

const ignoredShows = config.ignore?.shows ?? [];

const scanShows = (shows: Show[]): Promise<(Show | null)[]> => {
  const folders = extractFolders(
    showsDir!,
    removeDotFiles(readdirSync(showsDir!))
  );

  return Promise.all(
    folders.map(async (folder) => {
      if (ignoredShows.some((show) => show === folder)) {
        console.log(chalk.yellow(`Media "${folder}" has been ignored.`));
        return null;
      }

      const tmdbId = extractTmdbId(folder);
      const formattedName = removeReleaseYear(removeTmdbId(folder));

      const show = await searchShow(tmdbId, formattedName);

      if (!show) {
        console.log(chalk.redBright(`Media "${folder}" not found.`));
        return null;
      }

      const baseView = {
        showName: removeSpecialCharacters(show.name!),
        releaseYear: extractYearFromDate(show.first_air_date!),
        tmdbId: show.id,
      };

      const seasonsDir = path.resolve(showsDir!, folder);

      const seasons = extractFolders(seasonsDir, readdirSync(seasonsDir));

      const seasonsScan = seasons.map(async (season, index) => {
        const seasonFiles = removeDotFiles(
          readdirSync(path.resolve(showsDir!, folder, season))
        );

        const episodes = extractVideoFiles(seasonFiles).map((season) => ({
          name: season,
          type: 'episode',
        }));
        const subtitles = extractSubtitleFiles(seasonFiles).map((season) => ({
          name: season,
          type: 'subtitle',
        }));

        const seasonNumber = extractSeasonNumber(season) ?? index + 1;

        const seasonView = {
          ...baseView,
          seasonNumber: zerofill(seasonNumber),
        };

        const seasonInfo = await getShowSeason(show.id!, seasonNumber);

        return {
          previous: season,
          next: mustache.render(seasonFormatting!, seasonView),
          episodes: [...episodes, ...subtitles].map((file, episodeIndex) => {
            const [firstEpisode, lastEpisode] = extractEpisodes(file.name);

            if (lastEpisode) {
              return {
                previous: file.name,
                next: mustache.render(multipleEpisodesFormatting!, {
                  ...seasonView,
                  firstEpisode: zerofill(firstEpisode!),
                  lastEpisode: zerofill(lastEpisode),
                  ext: path.extname(file.name),
                }),
              };
            }

            const episodeInfo = seasonInfo.episodes?.find(
              ({ episode_number }) =>
                episode_number === (firstEpisode ?? episodeIndex + 1)
            );

            if (!episodeInfo) {
              return null;
            }

            return {
              previous: file.name,
              next: normalizeName(
                mustache.render(
                  file.type === 'subtitle'
                    ? episodeSubtitleFormatting!
                    : episodeFormatting!,
                  {
                    ...seasonView,
                    episodeNumber: zerofill(episodeInfo.episode_number!),
                    episodeName: episodeInfo.name,
                    isoCode: 'pt',
                    ext: path.extname(file.name),
                  }
                )
              ),
            };
          }),
        };
      });

      return {
        folder: {
          previous: folder,
          next: mustache.render(folderFormatting!, baseView),
        },
        seasons: await Promise.all(seasonsScan),
      };
    })
  );
};

const renameShows = async () => {
  const { shows } = getState();
  const scannedShows = (await scanShows(shows)).filter(
    (show) => show
  ) as Show[];

  scannedShows.forEach((show) => {
    renameFile(showsDir!, show.folder);

    show.seasons.forEach((season) => {
      renameFile(path.resolve(showsDir!, show.folder.next), season);

      (season.episodes.filter((episode) => episode) as FileName[]).forEach(
        (episode) => {
          renameFile(
            path.resolve(showsDir!, show.folder.next, season.next),
            episode
          );
        }
      );
    });
  });

  updateState({ shows });
};

renameShows();
