#!/usr/bin/env node

// Import required modules
import { createRepo } from './src/createRepo.js';
import { deployGitHubPages } from './src/deployGitHubPages.js';
import { deleteRepo } from './src/deleteRepo.js';
import { Octokit } from '@octokit/rest';
import { pushTemplate } from './src/pushTemplate.js';
import { generateQRCode } from './src/generateQRCode.js';

/**
 * Main function that executes the flow to create the repository,
 * push the template, deploy to GitHub Pages, and generate the QR Code.
 */
async function main() {
  let repoCreated = false;
  let owner;

  // 1. Validate command-line arguments
  const repoName = process.argv[2];
  if (!repoName) {
    console.error(
      'ERROR: You must provide the repository name.\nExample: node create-and-publish.js my-repo',
    );
    process.exit(1);
  }

  // 2. Validate the GitHub Token environment variable
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('ERROR: The GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  try {
    // 3. Retrieve the authenticated GitHub user's information
    const octokit = new Octokit({ auth: githubToken });
    const { data: authUser } = await octokit.rest.users.getAuthenticated();
    owner = authUser.login;

    // 4. Create the repository on GitHub
    console.log(`> Creating repository "${repoName}" for user "${owner}"...`);
    const repoData = await createRepo(owner, repoName, githubToken);
    repoCreated = true;
    console.log('Repository created successfully!');

    // 5. Get the clone URL of the newly created repository
    const repoUrl = repoData.clone_url;

    // 6. Push the template files (static content) to the repository
    console.log('> Pushing template (build files) to the repository...');
    await pushTemplate(owner, repoName, repoUrl, githubToken);
    console.log('> Template pushed successfully.');

    // 7. Deploy to GitHub Pages
    console.log('> Deploying to GitHub Pages...');
    const siteUrl = await deployGitHubPages(
      owner,
      repoName,
      repoUrl,
      githubToken,
    );

    console.log('Deployment completed successfully!');
    console.log(`Your GitHub Pages site URL: ${siteUrl}`);

    // 8. Generate the QR Code for the repository or site (depending on the implementation)
    console.log('> Generating QR Code...');
    await generateQRCode(siteUrl);
  } catch (error) {
    console.error('An error occurred during the process:');
    console.error(error);

    // In case of error, if the repository was created, attempt to delete it as a cleanup measure
    if (repoCreated) {
      console.error('Attempting to delete the repository due to the error...');
      try {
        await deleteRepo(owner, repoName, githubToken);
        console.log(`Repository ${owner}/${repoName} deleted successfully.`);
      } catch (deleteError) {
        console.error('Failed to delete the repository:', deleteError);
      }
    }
    process.exit(1);
  }
}

// Execute the main function
main();
