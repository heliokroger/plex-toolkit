import { execSync } from 'child_process';

export class StreamRip {
  public static search(query: string, type: 'album' | 'track' = 'track') {
    return execSync(`rip search --type ${type} "${query}"`, {
      stdio: 'inherit',
    });
  }
}
