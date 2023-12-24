const fetch = require('node-fetch');
const readline = require('readline');
const GITHUB_API = 'https://api.github.com';
const accessToken = 'your_access_token'; // Replace with your GitHub access token

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Failed to fetch data. Status: ${response.status}`);
  }

  return response.json();
}

async function getOpenPullRequests(owner, repoName) {
  const url = `${GITHUB_API}/repos/${owner}/${repoName}/pulls?state=open`;
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  return fetchJson(url, options);
}

async function closePullRequest(owner, repoName, prNumber) {
  const url = `${GITHUB_API}/repos/${owner}/${repoName}/pulls/${prNumber}`;
  const options = {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state: 'closed' }),
  };

  return fetchJson(url, options);
}

async function reviewAndClose(owner, repoName, pullRequest) {
  console.log(`Pull Request #${pullRequest.number} - Title: ${pullRequest.title}`);

  try {
    const answer = await askQuestion('Would you like to manually review this Pull Request? (yes/no): ');

    if (answer.toLowerCase() === 'yes') {
      console.log('Manually reviewing Pull Request. Skipping closure.');
    } else {
      await closePullRequest(owner, repoName, pullRequest.number);
      console.log(`Closed Pull Request #${pullRequest.number} as spam.`);
    }
  } catch (error) {
    console.error('Error during review:', error.message);
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function closeSpamPullRequests() {
  try {
    const owner = await askQuestion('Enter the repository owner (organization or username): ');
    const repoName = await askQuestion('Enter the repository name: ');
    const openPullRequests = await getOpenPullRequests(owner, repoName);
    const spamPullRequests = openPullRequests.filter(
      pr => pr.labels.some(label => label.name.toLowerCase() === 'spam')
    );

    for (const pullRequest of spamPullRequests) {
      await reviewAndClose(owner, repoName, pullRequest);
    }

    console.log('No more spam Pull Requests.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

closeSpamPullRequests();
