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
    console.log('> Initializing local Git repository...');
    const authenticatedUrl = repoUrl.replace('https://', `https://${token}@`);

    // Initialize local repo, commit, and push to 'main'
    execSync('rm -rf .git');
    execSync('git init', { stdio: 'inherit' });
    execSync('git status', { stdio: 'inherit' });
    execSync('git add ./index.html', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
    execSync(`git remote set-url origin ${authenticatedUrl}`, { stdio: 'inherit' });

    execSync('git push -u origin main', { stdio: 'inherit' });

    console.log('> Local repository synchronized with GitHub.');

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