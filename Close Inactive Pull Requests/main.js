const fetch = require('node-fetch');

const apiUrl = 'https://api.github.com/repos/your-username/your-repo/pulls'; // Replace with that of your own Github repository.
const authToken = 'your-github-auth-token'; // Replace with your Github authentication token.

// Finds date 3 months ago
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

async function getOpenPRs() {
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'User-Agent': 'Close-Old-PRs-App', // Replace user agent with a unique identifier for your application.
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PRs: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch PRs: ${error.message}`);
  }
}
// Close PRs that have been inactive for over 3 months
async function closeInactivePRs() {
  try {
    const openPRs = await getOpenPRs();

    for (const pr of openPRs) {
      const updatedAt = new Date(pr.updated_at);

      if (updatedAt < threeMonthsAgo) {
        console.log(`Closing PR #${pr.number} (${pr.title})`);
        const mergeResponse = await fetch(`${apiUrl}/${pr.number}/merge`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'User-Agent': 'Close-Old-PRs-App', // Replace user agent with a unique identifier for your application.
          },
        });

        if (!mergeResponse.ok) {
          console.error(`Failed to close PR #${pr.number}: ${mergeResponse.status} - ${mergeResponse.statusText}`);
        }
      }
    }
    console.log('Successfully closed all inactive PRs.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

closeInactivePRs();
