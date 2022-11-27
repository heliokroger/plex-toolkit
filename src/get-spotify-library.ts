import chalk from 'chalk';
import { Spotify } from './services';
import { getState, updateState } from './utils';

const getSpotifyLibrary = async (offset = 0): Promise<void> => {
  const {
    items: tracks,
    next,
    total,
  } = await Spotify.getTracks({
    offset,
  });

  const { spotify_songs } = getState();

  const updatedSongsList = [
    ...spotify_songs,
    ...tracks.map(({ track: { id, name, artists, album } }) => ({
      track: {
        id,
        name,
        artists: artists.map(({ id, name }) => ({ id, name })),
        album: {
          id: album.id,
          name: album.name,
        },
      },
    })),
  ];

  updateState({ spotify_songs: updatedSongsList });

  console.log(
    `${chalk.greenBright(`Obtained ${tracks.length} new songs.`)} ${chalk.grey(
      `(${updatedSongsList.length} out of ${total})`
    )}`
  );

  if (next) {
    return getSpotifyLibrary(updatedSongsList.length);
  } else {
    console.log(chalk.greenBright(`Concluded.`));
  }
};

getSpotifyLibrary(getState().spotify_songs.length);
