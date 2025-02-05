// pushTemplate.js
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * Executa o build na pasta "template" e retorna o caminho absoluto da pasta "build".
 * @returns {string} Caminho da pasta build.
 */
function runBuild() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Caminho absoluto para a pasta "template" (supondo que pushTemplate.js esteja na pasta "script/")
  const templatePath = path.join(__dirname, '../template');
  console.log('> Executando o build na pasta template...');

  try {
    // Executa "npm run build" na pasta template
    execSync('npm run build', { cwd: templatePath, stdio: 'inherit' });
  } catch (error) {
    console.error('Erro durante o build:', error);
    process.exit(1);
  }

  // Caminho para a pasta build gerada
  const buildPath = path.join(templatePath, 'build');
  const buildIndex = path.join(buildPath, 'index.html');

  if (!fs.existsSync(buildIndex)) {
    console.error(`Erro: index.html não encontrado em ${buildIndex}`);
    process.exit(1);
  }

  console.log(`Build concluído com sucesso. index.html encontrado em: ${buildIndex}`);
  return buildPath;
}

function setDynamicHomepage(owner, repoName){
  // Caminho do package.json dentro de 'template'
  const packageJsonPath = '../template/package.json';

  // Lê o package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Define dinamicamente a homepage
  packageJson.homepage = `https://${owner}.github.io/${repoName}/`;

  // Escreve de volta no package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + os.EOL);

  console.log(`Homepage configurada dinamicamente como: ${packageJson.homepage}`);
}

/**
 * Realiza o push do conteúdo da pasta build para o repositório GitHub e configura o GitHub Pages.
 *
 * @param {string} owner - Nome do usuário ou organização no GitHub.
 * @param {string} repoName - Nome do repositório.
 * @param {string} repoUrl - URL do repositório (clone_url).
 * @param {string} token - Token de autenticação do GitHub.
 * @returns {Promise<string>} - URL do site do GitHub Pages.
 */
export async function pushTemplate(owner, repoName, repoUrl, token) {

  setDynamicHomepage(owner, repoName)

  // Executa o build e obtém o caminho para a pasta build
  const buildFolder = runBuild();

  console.log('> Inicializando repositório Git local na pasta build...');
  // Gera a URL autenticada
  const authenticatedUrl = repoUrl.replace('https://', `https://${token}@`);

  // Executa os comandos Git dentro da pasta build para versionar todo o conteúdo
  try {
      execSync('rm -rf .git', { stdio: 'inherit' });
  } catch (err) {
    // Se não houver .git, pode ignorar o erro
    console.warn('Nenhum repositório Git anterior encontrado na pasta build.');
  }

  execSync('git init', { cwd: buildFolder, stdio: 'inherit' });
  execSync('git add .', { cwd: buildFolder, stdio: 'inherit' });
  execSync('git commit -m "Deploy build"', { cwd: buildFolder, stdio: 'inherit' });
  execSync('git branch -M main', { cwd: buildFolder, stdio: 'inherit' });
  execSync(`git remote add origin ${repoUrl}`, { cwd: buildFolder, stdio: 'inherit' });
  execSync(`git remote set-url origin ${authenticatedUrl}`, { cwd: buildFolder, stdio: 'inherit' });
  execSync('git push -u origin main --force', { cwd: buildFolder, stdio: 'inherit' });

  console.log('> Repositório local (pasta build) sincronizado com o GitHub.');

  // Retorna a URL final do site
  const siteUrl = `https://${owner}.github.io/${repoName}/`;
  console.log(`> GitHub Pages configurado. Acesse: ${siteUrl}`);
  return siteUrl;
}