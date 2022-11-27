export interface FileName {
  previous: string;
  next: string;
}

export interface Movie {
  folder: FileName;
  file: FileName;
}

export interface Season extends FileName {
  episodes: (FileName | null)[];
}

export interface Show {
  folder: FileName;
  seasons: Season[];
}

export interface Track {
  track: {
    id: string;
    name: string;
    artists: {
      id: string;
      name: string;
    }[];
    album: {
      id: string;
      name: string;
    };
  };
}

export interface State {
  open_subtitles_access_token: string;
  movies: Movie[];
  shows: Show[];
  spotify_songs: Track[];
  downloaded_songs: string[];
}

export interface Config {
  directories?: {
    movies?: string;
    shows?: string;
  };
  spotify?: {
    'access-token'?: string;
  };
  'open-subtitles'?: {
    'api-key'?: string;
    login?: {
      username?: string;
      password?: string;
    };
    language?: string;
  };
  tmdb?: {
    'api-key'?: string;
    language?: string;
  };
  'file-formatting'?: {
    movies?: {
      folder?: string;
      file?: string;
    };
    shows?: {
      folder?: string;
      season?: string;
      episode?: string;
      'multiple-episodes'?: string;
    };
    subtitles?: {
      movie?: string;
      episode?: string;
    };
  };
  ignore?: {
    shows?: string[];
    movies?: string[];
  };
}
