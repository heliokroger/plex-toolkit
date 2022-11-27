import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import yaml from 'yaml';
import merge from 'lodash/merge';
import type { State } from '../types';

export const statePath = path.resolve(__dirname, '..', '..', 'state.yaml');

const initialState: State = {
  open_subtitles_access_token: '',
  movies: [],
  shows: [],
  spotify_songs: [],
  downloaded_songs: [],
};

export const getState = () => {
  if (!existsSync(statePath)) {
    return initialState;
  }

  const state = readFileSync(statePath).toString('utf-8');
  return merge(yaml.parse(state), initialState) as State;
};

export const updateState = (partialState: Partial<State>) => {
  const state = getState();
  writeFileSync(statePath, yaml.stringify({ ...state, ...partialState }));
};
