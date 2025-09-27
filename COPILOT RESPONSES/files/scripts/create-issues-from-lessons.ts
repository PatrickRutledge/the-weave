import { Octokit } from "@octokit/rest";
import fs from "fs";

const token = process.env.GITHUB_TOKEN!;
const owner = process.env.GITHUB_REPOSITORY!.split("/")[0];
const repo = process.env.GITHUB_REPOSITORY!.split("/")[1];
const projectId = process.env.WEAVER_PROJECT_ID;
const addToProject = process.env.ADD_TO_PROJECT === "true";

async function main() {
  const octokit = new Octokit({ auth: token });
  const lessons = JSON.parse(fs.readFileSync("weaver-report.json", "utf8"));

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const title = lesson.title || `Weaver Lesson ${i + 1}`;
    const bodyParts: string[] = [];
    if (lesson.description) bodyParts.push(lesson.description);
    if (lesson.evidence) bodyParts.push(`\nEvidence:\n${lesson.evidence}`);
    if (lesson.references?.length) {
      bodyParts.push("\nReferences:");
      lesson.references.forEach((r: string) => bodyParts.push(`- ${r}`));
    }
    if (lesson.patterns?.length) {
      bodyParts.push("\nDetected Patterns:");
      lesson.patterns.forEach((p: string) => bodyParts.push(`- ${p}`));
    }
    if (lesson.recommended_actions?.length) {
      bodyParts.push("\nRecommended Actions:");
      lesson.recommended_actions.forEach((a: string) => bodyParts.push(`- ${a}`));
    }
    const labels = lesson.labels?.length ? lesson.labels : ["weaver", "lessons-learned"];

    const issue = await octokit.issues.create({ owner, repo, title, body: bodyParts.join("\n"), labels });
    if (addToProject && projectId) {
      await octokit.graphql(`
        mutation AddItem($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
            item { id }
          }
        }`, { projectId, contentId: issue.data.node_id }
      );
    }
    console.log(`Created #${issue.data.number} - ${title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});