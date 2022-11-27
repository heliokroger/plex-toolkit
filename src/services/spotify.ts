import fetch from 'node-fetch';
import type { Track } from '../types';
import { getConfig } from '../utils';

interface GetTracksResponse {
  items: Track[];
  next: string | null;
  total: number;
}

const config = getConfig();

export class Spotify {
  private static apiUrl = 'https://api.spotify.com/v1';

  public static async getTracks({ limit = 50, offset = 0 }) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const response = await fetch(
      `${this.apiUrl}/me/tracks?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.spotify?.['access-token']}`,
        },
      }
    );

    return (await response.json()) as GetTracksResponse;
  }
}
