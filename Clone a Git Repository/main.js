const { promisify } = require('util');
const { exec } = require('child_process');
const readline = require('readline');
const execPromise = promisify(exec);

async function cloneGitHubRepository(repoUrl, destinationPath) {
  try {
    const { stdout, stderr } = await execPromise(`git clone ${repoUrl} ${destinationPath}`);
    console.log('Repository cloned successfully!');
    console.log(stdout);
  } catch (error) {
    console.error(`Error cloning repository: ${error.message}.`);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter GitHub repository URL: ', async (githubRepoUrl) => {
  const destinationDirectory = await new Promise((resolve) => {
    rl.question('Enter local destination directory: ', (destination) => {
      resolve(destination);
    });
  });

  rl.close();

  await cloneGitHubRepository(githubRepoUrl, destinationDirectory);
});
