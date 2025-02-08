import { Octokit } from '@octokit/rest';

/**
 * Creates a new repository under the specified owner (user or org).
 *
 * @param {string} owner - GitHub username or organization
 * @param {string} repoName - Desired name for the new repo
 * @param {string} token - GitHub authentication token
 * @returns {Promise<object>} - The full repository data from the GitHub API
 */
export async function createRepo(owner, repoName, token) {
  const octokit = new Octokit({ auth: token });

  const response = await octokit.rest.repos.createForAuthenticatedUser({
    name: repoName,
    private: false,
    description: `Repository to serve the menu for ${repoName}`,
  });

  return response.data;
}
