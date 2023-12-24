const fetch = require('node-fetch');
const readline = require('readline');
const GITHUB_API = 'https://api.github.com';

const organization = 'your_organization'; // Replace with your GitHub organization
const accessToken = 'your_access_token'; // Replace with your GitHub access token.
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
async function getOpenPullRequests() {
  const url = `${GITHUB_API}/orgs/${organization}/repos?per_page=100&type=public`;
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  };

  // Fetch repositories within the organization
  const repositories = await fetchJson(url, options);
  // Fetch open pull requests for each repository
  const pullRequestsPromises = repositories.map(repo => {
    const prUrl = `${GITHUB_API}/repos/${organization}/${repo.name}/pulls?state=open`;
    return fetchJson(prUrl, options);
  });

  const pullRequestsArrays = await Promise.all(pullRequestsPromises);
  return pullRequestsArrays.flat();
}

async function closePullRequest(prNumber) {
  const url = `${GITHUB_API}/repos/${organization}/repoName/pulls/${prNumber}`;
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

async function reviewAndClose(pr) {
  console.log(`Pull Request #${pr.number} - Title: ${pr.title}`);
  const answer = await askQuestion('Would you like to manually review this PR? (yes/no): ');
  if (answer.toLowerCase() === 'yes') {
    console.log('Manually reviewing Pull Request. Skipping closure.');
  } else {
    try {
      await closePullRequest(pr.number);
      console.log(`Closed Pull Request #${pr.number} as spam.`);
    } catch (error) {
      console.error(`Error closing Pull Request #${pr.number}:`, error.message);
    }
  }
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

let spamPRs = [];

async function closeSpamPRs() {
  try {
    const openPullRequests = await getOpenPullRequests();
    spamPRs = openPullRequests.filter(
      pr => pr.labels.some(label => label.name.toLowerCase() === 'spam')
    );

    while (spamPRs.length > 0) {
      const pr = spamPRs.shift();
      await reviewAndClose(pr);
    }

    console.log('No more spam Pull Requests.');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

closeSpamPRs();
