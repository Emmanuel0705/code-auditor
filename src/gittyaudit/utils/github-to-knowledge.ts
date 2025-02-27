import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Convert exec to Promise-based
const execAsync = promisify(exec);

async function cloneGitHubRepository(
  repoUrl: string,
  tempDirPath?: string
): Promise<string> {
  // Validate GitHub URL
  if (!repoUrl || !repoUrl?.startsWith("https://github.com/")) {
    throw new Error("Invalid GitHub URL provided");
  }

  // Create a repository name for the temp directory
  const repoName =
    repoUrl.split("/").pop()?.replace(".git", "") || "github-repo";

  // Create a temporary directory if not specified
  const tmpDir =
    tempDirPath || path.join(os.tmpdir(), `${repoName}-${Date.now()}`);

  try {
    // Create the temporary directory
    await fs.mkdir(tmpDir, { recursive: true });
    console.log(`Created temporary directory: ${tmpDir}`);

    // Clone the repository
    console.log(`Cloning ${repoUrl} to ${tmpDir}...`);
    await execAsync(`git clone ${repoUrl} ${tmpDir}`);
    console.log("Repository cloned successfully");
    // await fs.rm(tmpDir, { recursive: true, force: true });
    return tmpDir;
  } catch (error) {
    console.error("Error during cloning:", error);
    throw error;
  }
}

// Export the function
export default cloneGitHubRepository;
