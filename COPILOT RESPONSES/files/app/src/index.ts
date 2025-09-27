import { Probot } from "probot";
import { request } from "@octokit/request";

export = (app: Probot) => {
  app.on("issue_comment.created", async (context) => {
    const comment = context.payload.comment.body.trim();
    const isPR = !!context.payload.issue.pull_request;
    if (!isPR) return;

    if (/^\/weaver\s+review\b/i.test(comment)) {
      const pr = await context.octokit.pulls.get(context.issue({ pull_number: context.payload.issue.number }));
      const base = pr.data.base.sha;
      const head = pr.data.head.sha;

      // Trigger workflow_dispatch for weaver-review.yml
      await request("POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches", {
        headers: { authorization: `token ${process.env.APP_INSTALLATION_TOKEN}` },
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        workflow_id: "weaver-review.yml",
        ref: pr.data.base.ref, // run on base branch
        inputs: {
          base,
          head,
          create_issues: "true",
          add_to_project: "false"
        }
      });

      await context.octokit.issues.createComment(context.issue({
        body: "✅ Weaver review requested. The workflow has been dispatched."
      }));
    }
  });
};