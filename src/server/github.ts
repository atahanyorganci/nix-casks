import { Octokit } from "@octokit/rest";
import { GITHUB_BRANCH, GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, GITHUB_WORKFLOW_ID } from "astro:env/server";

const octokit = new Octokit({
	auth: GITHUB_TOKEN,
});

export async function triggerUpdateArchiveWorkflow() {
	return await octokit.actions.createWorkflowDispatch({
		owner: GITHUB_OWNER,
		repo: GITHUB_REPO,
		ref: GITHUB_BRANCH,
		workflow_id: GITHUB_WORKFLOW_ID,
	});
}
