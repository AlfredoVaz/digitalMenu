// deleteRepo.js (ES Module)
import { Octokit } from '@octokit/rest';

/**
 * Deletes a GitHub repository for the specified owner and repo name.
 *
 * @param {string} owner - GitHub username or organization
 * @param {string} repoName - Name of the repository to delete
 * @param {string} token - GitHub authentication token
 */
export async function deleteRepo(owner, repoName, token) {
  const octokit = new Octokit({ auth: token });
  await octokit.rest.repos.delete({
    owner,
    repo: repoName,
  });
}
