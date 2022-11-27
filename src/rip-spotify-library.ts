import { getState, updateState } from './utils';
import type { Track } from './types';
import { StreamRip } from './services';
import chalk from 'chalk';

export const groupSongsByArtist = (songs: Track[]) => {
  return songs.reduce((prev, { track }) => {
    const [{ id: artistId }] = track.artists;
    const { id: albumId } = track.album;

    const artist = prev[artistId] ?? {};
    const album = artist[albumId];

    if (artist && album) {
      return {
        ...prev,
        [artistId]: {
          ...artist,
          [albumId]: [...album, { track }],
        },
      };
    }

    return {
      ...prev,
      [artistId]: {
        ...artist,
        [albumId]: [{ track }],
      },
    };
  }, {} as Record<string, Record<string, Track[]>>);
};

export const ripSpotifyLibrary = () => {
  const { spotify_songs } = getState();
  const artists = Object.values(groupSongsByArtist(spotify_songs));

  for (const artist of artists) {
    const albums = Object.values(artist);

    for (const tracks of albums) {
      const { downloaded_songs } = getState();

      if (tracks.length > 1) {
        const [
          {
            track: {
              id: trackId,
              artists: [{ name: artistName }],
              album: { name: albumName },
            },
          },
        ] = tracks;

        const albumAlreadyDownloaded = downloaded_songs.includes(trackId);

        if (albumAlreadyDownloaded) {
          console.log(
            chalk.gray(
              `Album "${artistName} - ${albumName}" already downloaded.`
            )
          );
        } else {
          console.log(`Searching for ${artistName} - ${albumName}...`);

          try {
            StreamRip.search(`${artistName} ${albumName}`, 'album');

            const albumTracks = tracks.map(({ track: { id } }) => id);

            updateState({
              downloaded_songs: [...downloaded_songs, ...albumTracks],
            });
          } catch (err) {}
        }
      }
    }
  }
};

ripSpotifyLibrary();
