const axios = require('axios');
const accessToken = 'YOUR_ACCESS_TOKEN'; // Replace with your personal access token.
const repoOwner = 'YOUR_REPO_OWNER'; // Replace with your GitHub username.
const repoName = 'YOUR_REPO_NAME'; // Replace with your repository's name.
const protectedBranches = ['main', 'master'];
// Threshold for staleness (i.e. any branches over 30 days old)
const staleThreshold = new Date();
staleThreshold.setDate(staleThreshold.getDate() - 30); 
async function deleteBranch(branch) {
  try {
    await axios.delete(
      `https://api.github.com/repos/${repoOwner}/${repoName}/git/refs/heads/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(`Deleted branch: ${branch}.`);
  } catch (error) {
    console.error(`Error deleting branch ${branch}: ${error.message}.`);
  }
}
async function deleteStaleBranches() {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repoOwner}/${repoName}/branches`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const branches = response.data.map(branch => branch.name);
    for (const branch of branches) {
      if (!protectedBranches.includes(branch)) {
        const branchInfoResponse = await axios.get(
          `https://api.github.com/repos/${repoOwner}/${repoName}/branches/${branch}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const lastCommitDate = new Date(branchInfoResponse.data.commit.committer.date);
        if (lastCommitDate < staleThreshold) {
          await deleteBranch(branch);
        }
      }
    }
  } catch (error) {
    console.error(`An unexpected error occurred: ${error.message}.`);
  }
}
deleteStaleBranches();
