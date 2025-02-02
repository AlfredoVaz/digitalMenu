#!/usr/bin/env node

import { createRepo } from './createRepo.js';
import { deployGitHubPages } from './deployGitHubPages.js';
import { deleteRepo } from './deleteRepo.js';
import { Octokit } from '@octokit/rest';

(async () => {
    let repoCreated = false;
    let repoName;
    let owner;        // We'll determine this dynamically
    let githubToken;

    try {
        // 1. Parse command-line arguments
        repoName = process.argv[2];
        if (!repoName) {
            console.error(
                'ERROR: You must provide the repository name.\nExample: node index.js my-repo'
            );
            process.exit(1);
        }

        // 2. Read the GitHub token from the environment
        githubToken = process.env.GITHUB_TOKEN;
        if (!githubToken) {
            console.error('ERROR: The GITHUB_TOKEN environment variable is not set.');
            process.exit(1);
        }

        // 3. Dynamically get the authenticated user
        const octokit = new Octokit({ auth: githubToken });
        const { data: authUser } = await octokit.rest.users.getAuthenticated();
        owner = authUser.login;  // e.g., "my-username"

        console.log(`> Creating repository "${repoName}" under owner "${owner}"...`);
        const repoData = await createRepo(owner, repoName, githubToken);
        repoCreated = true;
        console.log('Repository created successfully!');

        // 4. Retrieve the clone_url from the newly created repo
        const repoUrl = repoData.clone_url;
        
        // 5. Push the build files (static content) using pushTemplate
        console.log('> Pushing template (build files) to the repository...');
        await pushTemplate(owner, repoName, repoUrl, githubToken);
        console.log('> Template pushed successfully.');
        
        // 6. Deploy to GitHub Pages using deployGitHubPages
        console.log('> Deploying to GitHub Pages...');
        const siteUrl = await deployGitHubPages(owner, repoName, repoUrl, githubToken);

        console.log('Deployment completed successfully!');
        console.log(`Your GitHub Pages site URL: ${siteUrl}`);
    } catch (error) {
        console.error('An error occurred during the process:');
        console.error(error);

        // Clean-up logic: attempt to delete the newly created repo if something failed
        if (repoCreated && githubToken) {
            console.error('Attempting to delete the repository due to the error...');
            try {
                await deleteRepo(owner, repoName, githubToken);
                console.log(`Repository ${owner}/${repoName} has been deleted successfully.`);
            } catch (deleteError) {
                console.error('Failed to delete the repository:', deleteError);
            }
        }
        process.exit(1);
    }
})();