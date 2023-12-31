const axios = require('axios');
const owner = 'YOUR_USERNAME'; // Replace with your Github username
const repo = 'YOUR_REPO'; // Replace with repository name
const token = 'YOUR_TOKEN'; // Replace with your Github access token
const headers = {
  Authorization: `Bearer ${token}`,
};

// Create a branch
async function createBranch(branchName, baseBranch) {
  try {
    const { data: branchData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`, {
      headers,
    });
    const sha = branchData.object.sha;
    await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      ref: `refs/heads/${branchName}`,
      sha,
    }, {
      headers,
    });
    console.log(`Branch '${branchName}' created successfully.`);
  } catch (error) {
    console.error(`Error creating branch '${branchName}':`, error.response.data.message || error.message);
  }
}

// Rename a branch
async function renameBranch(oldName, newName) {
  try {
    const { data: branchData } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${oldName}`, {
      headers,
    });
    const sha = branchData.commit.sha;
    await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${oldName}`, {
      ref: `refs/heads/${newName}`,
      sha,
    }, {
      headers,
    });
    console.log(`Branch '${oldName}' renamed to '${newName}' successfully!`);
  } catch (error) {
    console.error(`Error renaming branch '${oldName}':`, error.response.data.message || error.message);
  }
}

// Delete a branch
async function deleteBranch(branchName) {
  try {
    await axios.delete(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
      headers,
    });
    console.log(`Branch '${branchName}' deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting branch '${branchName}':`, error.response.data.message || error.message);
  }
}

// Copy commits from one branch to another
async function copyCommits(sourceBranch, destinationBranch) {
  try {
    const { data: comparison } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/compare/${sourceBranch}...${destinationBranch}`, {
      headers,
    });
    const commitSHAs = comparison.commits.map((commit) => commit.sha);
    await axios.patch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${destinationBranch}`, {
      sha: commitSHAs[commitSHAs.length - 1],
    }, {
      headers,
    });
    console.log(`Commits copied from '${sourceBranch}' to '${destinationBranch}' successfully!`);
  } catch (error) {
    console.error(`Error copying commits from '${sourceBranch}' to '${destinationBranch}':`, error.response.data.message || error.message);
  }
}

// Example ussage:
createBranch('new-branch', 'main');
renameBranch('old-branch', 'new-branch');
deleteBranch('branch-to-delete');
copyCommits('source-branch', 'destination-branch');
