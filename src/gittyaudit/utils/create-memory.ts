import { AgentRuntime, knowledge, stringToUuid } from "@elizaos/core";
import path from "path";
import { glob } from "glob";
import fs from "fs/promises";
import { createHash } from "crypto";

export const createMemoriesFromFiles = async (filePath: string) => {
  console.log("Create memories");

  const searchPath = path.join(filePath, "**/*");

  const files = await glob(searchPath, { nodir: true });

  const codebase = [];

  // Define files to exclude content from but still include in directory listing
  const excludeContentPatterns = [
    // JavaScript/Node.js
    "yarn.lock",
    "package-lock.json",
    "pnpm-lock.yaml",
    ".lock",
    "npm-shrinkwrap.json",

    // Ruby
    "Gemfile.lock",

    // Python
    "Pipfile.lock",
    "poetry.lock",
    "requirements.txt.hash",

    // PHP
    "composer.lock",

    // .NET/C#
    "packages.lock.json",

    // Java/Kotlin
    "gradle.lockfile",

    // Go
    "go.sum",

    // Rust
    "Cargo.lock",

    // Swift
    "Package.resolved",

    // Dart/Flutter
    "pubspec.lock",

    // Elixir
    "mix.lock",

    // Haskell
    "cabal.project.freeze",
    "stack.yaml.lock",

    // General build artifacts
    "yarn-error.log",
    ".gradle/",
    ".nuget/",
    "node_modules/",
  ];

  // Define extensions that are likely not text-based
  const nonTextExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".ico",
    ".svg",
    ".webp",
    ".mp3",
    ".mp4",
    ".wav",
    ".ogg",
    ".avi",
    ".mov",
    ".zip",
    ".tar",
    ".gz",
    ".rar",
    ".7z",
    ".ttf",
    ".woff",
    ".woff2",
    ".eot",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
  ];

  for (const file of files) {
    const relativePath = path.relative(filePath, file);
    const fileExt = path.extname(file).toLowerCase();

    // Check if we should exclude content
    const isLockFile = excludeContentPatterns.some(
      (pattern) =>
        relativePath.endsWith(pattern) || relativePath.includes(pattern)
    );
    const isNonTextFile = nonTextExtensions.includes(fileExt);

    if (isLockFile || isNonTextFile) {
      // Include only the directory path, not the content
      codebase.push(`Directory ${relativePath} \n content: [Content excluded]`);
    } else {
      // Include full content for other files
      const content = await fs.readFile(file, "utf-8");
      codebase.push(`Directory ${relativePath} \n content: ${content}`);
    }
  }

  await fs.rm(filePath, { recursive: true, force: true });

  return codebase.join("\n\n");
};
