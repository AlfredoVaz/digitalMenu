import { execSync } from 'child_process';
import { Octokit } from '@octokit/rest';

/**
 * Initializes the local Git repo, makes a commit/push, and configures GitHub Pages.
 *
 * @param {string} owner - The GitHub username or organization.
 * @param {string} repoName - The name of the already existing GitHub repository.
 * @param {string} repoUrl - The clone_url of the repository.
 * @param {string} token - The GitHub authentication token.
 * @returns {Promise<string>} - Returns the URL of the GitHub Pages site.
 */
export async function deployGitHubPages(owner, repoName, repoUrl, token) {
    
    console.log('> Configuring GitHub Pages for the main branch...');
    const octokit = new Octokit({ auth: token });

    // Enable GitHub Pages from the 'main' branch
    await octokit.request('POST /repos/{owner}/{repo}/pages', {
        owner,
        repo: repoName,
        source: {
            branch: 'main',
            path: '/'
        },
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    // Return the final site URL
    return `https://${owner}.github.io/${repoName}/`;
}