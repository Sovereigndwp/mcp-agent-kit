import { githubClient } from '../utils/http.js';
import { cacheStore } from '../utils/kv.js';
import { logger } from '../utils/logger.js';

export interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  html_url: string;
  published_at: string;
  body: string;
  assets: Array<{
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
  }>;
  prerelease: boolean;
  draft: boolean;
}

export class GitHubLatestReleaseTool {
  /**
   * Get latest release for a GitHub repository
   */
  async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease> {
    const cacheKey = `github_release_${owner}_${repo}`;
    const cached = cacheStore.get<GitHubRelease>(cacheKey);
    
    // Return cached release if it's less than 1 hour old
    if (cached && Date.now() - (cacheStore.get<number>(`${cacheKey}_timestamp`) || 0) < 3600000) {
      return cached;
    }

    try {
      const response = await githubClient.get(`/repos/${owner}/${repo}/releases/latest`);
      
      const release: GitHubRelease = {
        id: response.id,
        name: response.name,
        tag_name: response.tag_name,
        html_url: response.html_url,
        published_at: response.published_at,
        body: response.body,
        assets: response.assets.map((asset: any) => ({
          name: asset.name,
          size: asset.size,
          download_count: asset.download_count,
          browser_download_url: asset.browser_download_url
        })),
        prerelease: response.prerelease,
        draft: response.draft
      };

      // Cache the result
      cacheStore.set(cacheKey, release, 3600); // 1 hour TTL
      cacheStore.set(`${cacheKey}_timestamp`, Date.now(), 3600);

      return release;
    } catch (error) {
      logger.error('Failed to fetch GitHub release:', error);
      
      if (cached) {
        logger.warn('Using cached GitHub release due to API failure');
        return cached;
      }
      
      throw new Error(`Unable to fetch latest release for ${owner}/${repo}`);
    }
  }

  /**
   * Get recent releases for a repository
   */
  async getRecentReleases(owner: string, repo: string, limit: number = 5): Promise<GitHubRelease[]> {
    const cacheKey = `github_releases_${owner}_${repo}_${limit}`;
    const cached = cacheStore.get<GitHubRelease[]>(cacheKey);
    
    // Return cached releases if they're less than 1 hour old
    if (cached && Date.now() - (cacheStore.get<number>(`${cacheKey}_timestamp`) || 0) < 3600000) {
      return cached;
    }

    try {
      const response = await githubClient.get(`/repos/${owner}/${repo}/releases?per_page=${limit}`);
      
      const releases: GitHubRelease[] = response.map((release: any) => ({
        id: release.id,
        name: release.name,
        tag_name: release.tag_name,
        html_url: release.html_url,
        published_at: release.published_at,
        body: release.body,
        assets: release.assets.map((asset: any) => ({
          name: asset.name,
          size: asset.size,
          download_count: asset.download_count,
          browser_download_url: asset.browser_download_url
        })),
        prerelease: release.prerelease,
        draft: release.draft
      }));

      // Cache the result
      cacheStore.set(cacheKey, releases, 3600); // 1 hour TTL
      cacheStore.set(`${cacheKey}_timestamp`, Date.now(), 3600);

      return releases;
    } catch (error) {
      logger.error('Failed to fetch GitHub releases:', error);
      
      if (cached) {
        logger.warn('Using cached GitHub releases due to API failure');
        return cached;
      }
      
      throw new Error(`Unable to fetch recent releases for ${owner}/${repo}`);
    }
  }

  /**
   * Check if there's a newer release than the current version
   */
  async checkForNewerRelease(
    owner: string,
    repo: string,
    currentVersion: string
  ): Promise<{
    hasNewer: boolean;
    latestRelease?: GitHubRelease;
    currentVersion: string;
  }> {
    try {
      const latestRelease = await this.getLatestRelease(owner, repo);
      
      // Simple version comparison (assumes semantic versioning)
      const hasNewer = this.compareVersions(latestRelease.tag_name, currentVersion) > 0;
      
      return {
        hasNewer,
        latestRelease: hasNewer ? latestRelease : undefined,
        currentVersion
      };
    } catch (error) {
      logger.error('Failed to check for newer release:', error);
      throw new Error(`Unable to check for newer release for ${owner}/${repo}`);
    }
  }

  /**
   * Get release notes for a specific version
   */
  async getReleaseNotes(owner: string, repo: string, tag: string): Promise<{
    tag: string;
    notes: string;
    published_at: string;
  }> {
    const cacheKey = `github_release_notes_${owner}_${repo}_${tag}`;
    const cached = cacheStore.get<any>(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 3600000) {
      return cached;
    }

    try {
      const response = await githubClient.get(`/repos/${owner}/${repo}/releases/tags/${tag}`);
      
      const result = {
        tag: response.tag_name,
        notes: response.body,
        published_at: response.published_at
      };

      // Cache the result
      cacheStore.set(cacheKey, { ...result, timestamp: Date.now() }, 3600);

      return result;
    } catch (error) {
      logger.error('Failed to fetch release notes:', error);
      throw new Error(`Unable to fetch release notes for ${owner}/${repo}@${tag}`);
    }
  }

  /**
   * Simple version comparison
   */
  private compareVersions(version1: string, version2: string): number {
    const v1 = version1.replace(/^v/, '').split('.').map(Number);
    const v2 = version2.replace(/^v/, '').split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0;
      const num2 = v2[i] || 0;
      
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    
    return 0;
  }
}

// Create and export default instance
export const githubLatestReleaseTool = new GitHubLatestReleaseTool();

// Export convenience functions
export const getLatestRelease = (owner: string, repo: string) => githubLatestReleaseTool.getLatestRelease(owner, repo);
export const getRecentReleases = (owner: string, repo: string, limit?: number) => githubLatestReleaseTool.getRecentReleases(owner, repo, limit);
export const checkForNewerRelease = (owner: string, repo: string, currentVersion: string) => githubLatestReleaseTool.checkForNewerRelease(owner, repo, currentVersion);
export const getReleaseNotes = (owner: string, repo: string, tag: string) => githubLatestReleaseTool.getReleaseNotes(owner, repo, tag);
