import { removeTmdbId, removeReleaseYear, normalizeName } from './formatting';

describe('testing formatting functions', () => {
  describe('testing removeTmdbId function', () => {
    it('should be able to remove the tmdb attribute from a file name', () => {
      const result = removeTmdbId('Movie {tmdb-123}');
      expect(result.trim()).toBe('Movie');
    });
  });

  describe('testing removeReleaseYear function', () => {
    it('should be able to remove the release year from a file name', () => {
      const result = removeReleaseYear('Movie (2001)');
      expect(result.trim()).toBe('Movie');
    });
  });

  describe('testing normalizeName function', () => {
    it('should be able to remove question marks and slashes from a string', () => {
      const result = normalizeName('Episode: 01/ Episode 02?');
      expect(result).toBe('Episode 01 Episode 02');
    });
  });
});
