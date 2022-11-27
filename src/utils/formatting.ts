export const removeTmdbId = (str: string) =>
  str.replace(/{tmdb-[0-9]{0,}}/gm, '');

export const removeReleaseYear = (str: string) =>
  str.replace(/\([0-9]{4}\)/gm, '');

export const extractYearFromDate = (date: string) => date.split('-').at(0);

export const removeSpecialCharacters = (str: string) => str.replace(/:/gm, '');

export const zerofill = (num: string | number) => String(num).padStart(2, '0');

export const extractTmdbId = (str: string) => {
  const result = /{tmdb-([0-9]{0,})}/gm.exec(str);

  if (Array.isArray(result)) {
    const [, tmdbId] = result;
    return Number(tmdbId);
  }

  return null;
};

export const compareStrings = (a: string, b: string) =>
  a.localeCompare(b, 'pt-BR') === 0;

export const extractSeasonNumber = (str: string) => {
  const result = /(Season|S) ?([0-9]{1,2})/gm.exec(str);

  if (Array.isArray(result)) {
    const [, , seasonNumber] = result;
    return Number(seasonNumber);
  }

  return null;
};

export const extractEpisodes = (str: string): (number | undefined)[] => {
  const result = /(S|s)[0-9]{1,2}(E|e)([0-9]{1,2})-?(E|e)?([0-9]{1,2})?/gm.exec(
    str
  );

  if (Array.isArray(result)) {
    const firstEpisode = result.at(3);
    const lastEpisode = result.at(5);

    if (!lastEpisode) {
      return [Number(firstEpisode)];
    }

    return [Number(firstEpisode), Number(lastEpisode)];
  }

  return [undefined];
};

export const normalizeName = (name: string) => name.replace(/\/|\?|\:/gm, '');
