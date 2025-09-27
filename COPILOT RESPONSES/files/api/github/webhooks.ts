import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac, timingSafeEqual } from "crypto";
import fetch from "node-fetch";

function verify(signature: string | undefined, secret: string, payload: string) {
  if (!signature) return false;
  const hmac = createHmac("sha256", secret);
  const digest = Buffer.from("sha256=" + hmac.update(payload).digest("hex"), "utf8");
  const check = Buffer.from(signature, "utf8");
  return digest.length === check.length && timingSafeEqual(digest, check);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET!;
  const sig = req.headers["x-hub-signature-256"] as string | undefined;
  const payload = JSON.stringify(req.body);

  if (!verify(sig, secret, payload)) return res.status(401).send("invalid signature");

  const event = req.headers["x-github-event"];
  if (event === "issue_comment" && req.body.action === "created") {
    const body = (req.body.comment.body || "").trim();
    const pr = req.body.issue.pull_request;
    if (pr && /^\/weaver\s+review\b/i.test(body)) {
      // Get PR details for SHAs
      const { repository } = req.body;
      const prNumber = req.body.issue.number;
      const ghToken = process.env.APP_INSTALLATION_TOKEN!;

      const prResp = await fetch(`https://api.github.com/repos/${repository.owner.login}/${repository.name}/pulls/${prNumber}`, {
        headers: { Authorization: `token ${ghToken}` }
      }).then(r => r.json());

      const { base, head } = prResp;
      // Dispatch workflow
      await fetch(`https://api.github.com/repos/${repository.owner.login}/${repository.name}/actions/workflows/weaver-review.yml/dispatches`, {
        method: "POST",
        headers: { Authorization: `token ${ghToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ref: base.ref, inputs: { base: base.sha, head: head.sha, create_issues: "true", add_to_project: "false" } })
      });

      return res.status(200).json({ ok: true });
    }
  }

  return res.status(200).json({ ok: true });
}