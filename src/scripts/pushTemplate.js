// pushTemplate.js
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Runs the build command in the "template" folder and returns the absolute path of the "build" folder.
 *
 * @returns {string} Absolute path to the build folder.
 */
function runBuild() {
  // Determine the current file's path and directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Construct the absolute path for the "template" folder (assuming pushTemplate.js is inside a "scripts/" folder)
  const templatePath = path.join(__dirname, '../template');
  console.log('> Running build in the template folder...');

  // Execute "npm install" in the template folder
  execSync('npm install', { cwd: templatePath, stdio: 'inherit' });
  // Execute "npm run build" in the template folder
  execSync('npm run build', { cwd: templatePath, stdio: 'inherit' });

  // Define the build folder path and check for index.html to confirm a successful build
  const buildPath = path.join(templatePath, 'build');
  const buildIndexPath = path.join(buildPath, 'index.html');

  if (!fs.existsSync(buildIndexPath)) {
    console.error(`Error: index.html not found in ${buildIndexPath}`);
    process.exit(1);
  }

  console.log(
    `Build completed successfully. index.html found at: ${buildIndexPath}`,
  );
  return buildPath;
}

/**
 * Sets the dynamic homepage URL in the package.json located in the template folder.
 *
 * @param {string} owner - GitHub username or organization name.
 * @param {string} repoName - Name of the repository.
 */
function setDynamicHomepage(owner, repoName) {
  // Determine the absolute path for the package.json inside the "template" folder
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const packageJsonPath = path.join(__dirname, '../template/package.json');

  // Read the package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Dynamically set the homepage property
  packageJson.homepage = `https://${owner}.github.io/${repoName}/`;

  // Write the updated package.json back to file
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + os.EOL,
  );
  console.log(`Homepage dynamically set to: ${packageJson.homepage}`);
}

/**
 * Pushes the content of the build folder to the GitHub repository and configures GitHub Pages.
 *
 * @param {string} owner - GitHub username or organization name.
 * @param {string} repoName - Repository name.
 * @param {string} repoUrl - Repository URL (clone_url).
 * @param {string} token - GitHub authentication token.
 * @returns {Promise<string>} URL of the GitHub Pages site.
 */
export async function pushTemplate(owner, repoName, repoUrl, token) {
  // Set the dynamic homepage in package.json before building
  setDynamicHomepage(owner, repoName);

  // Run the build and get the absolute path of the build folder
  const buildFolder = runBuild();

  console.log('> Initializing local Git repository in the build folder...');
  // Generate the authenticated URL by injecting the token
  const authenticatedUrl = repoUrl.replace(
    'https://',
    `https://${owner}:${token}@`,
  );
  // Remove any existing .git folder in the build folder to ensure a fresh Git initialization
  try {
    execSync('rm -rf .git', { cwd: buildFolder, stdio: 'inherit' });
  } catch (err) {
    // If there is no .git folder, ignore the error
    console.warn('No previous Git repository found in the build folder.');
  }

  // Initialize a new Git repository and commit the build files
  execSync('git init', { cwd: buildFolder, stdio: 'inherit' });
  execSync('git add .', { cwd: buildFolder, stdio: 'inherit' });
  execSync('git commit -m "Deploy build"', {
    cwd: buildFolder,
    stdio: 'inherit',
  });
  execSync('git branch -M main', { cwd: buildFolder, stdio: 'inherit' });

  // Add remote origin using the provided repository URL and update it to include authentication
  execSync(`git remote add origin ${repoUrl}`, {
    cwd: buildFolder,
    stdio: 'inherit',
  });
  execSync(`git remote set-url origin ${authenticatedUrl}`, {
    cwd: buildFolder,
    stdio: 'inherit',
  });

  // Force push the main branch to GitHub
  execSync('git push -u origin main --force', {
    cwd: buildFolder,
    stdio: 'inherit',
  });
  console.log('> Local repository (build folder) synchronized with GitHub.');

  // Construct the final GitHub Pages URL and return it
  const siteUrl = `https://${owner}.github.io/${repoName}/`;
  console.log(`> GitHub Pages configured. Access your site at: ${siteUrl}`);
  return siteUrl;
}
