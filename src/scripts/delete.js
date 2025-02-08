#!/usr/bin/env node
import { deleteRepo } from './src/deleteRepo.js';
import { Octokit } from '@octokit/rest';

/**
 * Main function that executes the flow to create the repository,
 * push the template, deploy to GitHub Pages, and generate the QR Code.
 */
async function main() {
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

    await deleteRepo(owner, repoName, githubToken);
    console.log('Repository deleted successfully!');
  } catch (error) {
    console.error('An error occurred during the process:');
    console.error(error);

    process.exit(1);
  }
}

// Execute the main function
main();
