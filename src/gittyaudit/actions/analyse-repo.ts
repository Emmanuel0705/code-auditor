import {
  type Action,
  type ActionExample,
  elizaLogger,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  ModelClass,
  composeContext,
  generateObjectDeprecated,
  generateObject,
} from "@elizaos/core";
import path, { resolve } from "path";
import cloneGitHubRepository from "../utils/github-to-knowledge.ts";
import { createMemoriesFromFiles } from "../utils/create-memory.ts";
import { uploadJsonToFilecoin } from "../utils/upload.ts";
// import { fetchGitHubRepoCode } from "../utils/github";
import { z } from "zod";
import { resolveShortenedUrl } from "../utils/resolve-shortner.ts";

export const reportSchema: any = z.object({
  score: z.string().optional(),
  feedback: z.string().optional(),
  suggestions: z.array(
    z.object({
      improvement: z.string(),
      delta: z.number(),
    })
  ),
});

export interface AnalyzeRepoContent {
  url: string;
}

export function isAnalyzeRepoContent(
  content: AnalyzeRepoContent
): content is AnalyzeRepoContent {
  return typeof content.url === "string";
}

const analyzeRepoTemplate = `Respond with a JSON markdown block containing only the extracted values.

Extract the any URL from the request.

Example response:
\`\`\`json
{
    "url": "https://t.co/2l6kC5oDQc"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the URL and return it as JSON.`;

export default {
  name: "ANALYZE_GITHUB_REPO",
  similes: [
    "CHECK_GITHUB_REPO",
    "CODE_REVIEW_GITHUB",
    "ANALYZE_REPO",
    "REPO_SCORE",
    "GITHUB_CODE_QUALITY",
  ],
  description:
    "Analyzes a GitHub repository, scores its code quality, and provides feedback with improvement suggestions.",
  validate: async (_runtime: IAgentRuntime, _message: Memory) => {
    return true;
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<boolean> => {
    elizaLogger.log("Starting ANALYZE_GITHUB_REPO handler...");

    // Compose repository analysis context
    const analyzeRepoContext = composeContext({
      state,
      template: analyzeRepoTemplate,
    });

    // Generate analysis content
    const content = await generateObjectDeprecated({
      runtime,
      context: analyzeRepoContext,
      modelClass: ModelClass.MEDIUM,
    });

    if (!isAnalyzeRepoContent(content)) {
      elizaLogger.error("Invalid repository URL.");
      if (callback) {
        callback({
          text: "Invalid repository URL. Please provide a valid GitHub repository URL.",
          content: { error: "Invalid repository URL" },
        });
      }
      return false;
    }

    const repoUrl = await resolveShortenedUrl(content.url);

    // const rootDir = process.cwd();
    // const repositoryDir = path.join(rootDir, "repositories");

    const clonedRepositoryDir = await cloneGitHubRepository(repoUrl);

    const codebase = await createMemoriesFromFiles(clonedRepositoryDir);

    try {
      const prompt = `code ${codebase} Respond with a JSON markdown block containing only the opinion values.
      GOAL: Score the provided code out of 100 and provide detailed feedback for improvements.

I need you to evaluate the following code with high standards. Be strict in your assessment and provide specific suggestions for improvements.

For each improvement you suggest, include how many points could be gained if the improvement is implemented.

suggestions should be an array of objects.

Your response should be in the following JSON format:
\`\`\`json
{
  "score": 75,
  "feedback": "This code has good structure but lacks proper error handling and documentation.",
  "suggestions": "[{\"improvement\": \"Enhance Security: The GITHUB_SECRET in middleware/signature.ts defaults to ABCD123. This is a major security vulnerability. It should be mandatory to configure a strong, unique secret. Also, consider using a more robust method for storing secrets, such as a dedicated secrets management service, especially in production environments.\", \"delta\": 8}, {\"improvement\": \"Improve Error Handling: The sendToken function in src/utils/transfer.ts catches errors but doesn't handle them gracefully. Implement retry mechanisms for transient errors (e.g., network issues). Also, provide more informative error messages to the caller.\", \"delta\": 7}, {\"improvement\": \"Centralize Configuration: The REWARDING_AMOUNT is defined directly in src/utils/twitter.ts and src/handler/webhook.ts. This value should be centralized in the .env file and accessed via process.env. This makes it easier to manage and update.\", \"delta\": 5}]"
  }
\`\`\`
  
`;

      // // Generate analysis content
      const report: any = await generateObject({
        runtime,
        context: prompt,
        modelClass: ModelClass.MEDIUM,
        schema: reportSchema,
      });

      const upload: any = await uploadJsonToFilecoin(report?.object);

      const url = `https://gateway.lighthouse.storage/ipfs/${upload.data.Hash}`;

      callback({
        text: `Repository analysis completed. check report here ${url}`,
      });

      return true;
    } catch (error) {
      elizaLogger.error("Error analyzing repository:", error);
      if (callback) {
        callback({
          text: `Error analyzing repository: ${error.message}`,
          content: { error: error.message },
        });
      }
      return false;
    }
  },
  examples: [
    [
      {
        user: "{{user1}}",
        content: {
          text: "Can you analyze the GitHub repository at https://github.com/user/repo?",
        },
      },
      {
        user: "{{agent}}",
        content: {
          text: "Analyzing the repository at https://github.com/user/repo. I'll provide a score and feedback shortly.",
        },
      },
    ],
  ] as ActionExample[][],
} as Action;
