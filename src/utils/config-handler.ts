import { readFileSync } from 'fs';
import path from 'path';
import yaml from 'yaml';
import type { Config } from '../types';

const initialConfig: Config = {
  directories: {
    movies: '',
    shows: '',
  },
  tmdb: {
    'api-key': '',
    language: '',
  },
  spotify: {
    'access-token': '',
  },
  'file-formatting': {
    movies: {
      folder: '',
      file: '',
    },
    shows: {
      folder: '',
      season: '',
      episode: '',
      'multiple-episodes': '',
    },
    subtitles: {
      movie: '',
      episode: '',
    },
  },
  ignore: {
    movies: [],
    shows: [],
  },
};

export const configPath = path.resolve(__dirname, '..', '..', 'config.yaml');

export const getConfig = () => {
  const state = readFileSync(configPath).toString('utf-8');
  return { ...initialConfig, ...yaml.parse(state) } as Config;
};

const config = getConfig();
