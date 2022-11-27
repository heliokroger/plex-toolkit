import { MovieDb } from 'moviedb-promise';
import { getConfig } from '../utils';

const config = getConfig();

const language = config.tmdb?.language;

const mdb = new MovieDb(config.tmdb?.['api-key']!);

export const searchMovie = async (id: number | null, query: string) => {
  if (id) {
    return mdb.movieInfo({ id, language });
  }

  const { results } = await mdb.searchMovie({
    query: query,
    language,
  });

  if (!results?.length) {
    return null;
  }

  return results.at(0);
};

export const searchShow = async (id: number | null, query: string) => {
  if (id) {
    return mdb.tvInfo({ id, language });
  }

  const { results } = await mdb.searchTv({
    query: query,
    language,
  });

  if (!results?.length) {
    return null;
  }

  return results.at(0);
};

export const getShowSeason = (showId: number, seasonNumber: number) =>
  mdb.seasonInfo({ id: showId, season_number: seasonNumber, language });
