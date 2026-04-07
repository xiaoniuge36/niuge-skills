#!/usr/bin/env node

import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const manifestPath = path.join(repoRoot, "upstream-skills.json");
const stateFileName = ".upstream-sync.json";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const selectedSkills = args.skills.length > 0
    ? manifest.skills.filter((skill) => args.skills.includes(skill.name))
    : manifest.skills;

  const missingSkills = args.skills.filter(
    (name) => !manifest.skills.some((skill) => skill.name === name),
  );
  if (missingSkills.length > 0) {
    throw new Error(`Unknown skill name(s): ${missingSkills.join(", ")}`);
  }

  if (selectedSkills.length === 0) {
    console.log("No skills selected.");
    return;
  }

  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "niuge-skills-sync-"),
  );

  try {
    const repoCache = new Map();

    for (const skill of selectedSkills) {
      const repoKey = `${skill.repo}#${skill.branch}`;
      let checkoutDir = repoCache.get(repoKey);

      if (!checkoutDir) {
        checkoutDir = path.join(tempRoot, `repo-${repoCache.size + 1}`);
        console.log(`Cloning ${skill.repo} (${skill.branch})...`);
        await run("git", [
          "clone",
          "--depth",
          "1",
          "--branch",
          skill.branch,
          skill.repo,
          checkoutDir,
        ]);
        repoCache.set(repoKey, checkoutDir);
      }

      await syncSkill(skill, checkoutDir);
    }
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
}

async function syncSkill(skill, checkoutDir) {
  const sourceDir = path.join(checkoutDir, ...skill.sourcePath.split("/"));
  const targetDir = path.join(repoRoot, ...skill.targetPath.split("/"));
  const excludes = new Set(skill.exclude ?? []);
  const sourceFiles = await listFiles(sourceDir);
  const managedFiles = sourceFiles.filter((relativePath) => !excludes.has(relativePath));
  const statePath = path.join(targetDir, stateFileName);
  const previousState = await readJsonIfExists(statePath);
  const previousManagedFiles = previousState?.managedFiles ?? [];

  await fs.mkdir(targetDir, { recursive: true });

  const currentFiles = new Set(managedFiles);
  const staleFiles = previousManagedFiles.filter(
    (relativePath) => !currentFiles.has(relativePath),
  );

  for (const relativePath of staleFiles) {
    const destinationPath = path.join(targetDir, ...relativePath.split("/"));
    await fs.rm(destinationPath, { force: true });
    await removeEmptyParentDirs(path.dirname(destinationPath), targetDir);
  }

  for (const relativePath of managedFiles) {
    const sourcePath = path.join(sourceDir, ...relativePath.split("/"));
    const destinationPath = path.join(targetDir, ...relativePath.split("/"));
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }

  const nextState = {
    repo: skill.repo,
    branch: skill.branch,
    sourcePath: skill.sourcePath,
    targetPath: skill.targetPath,
    managedFiles,
  };

  const nextStateContent = `${JSON.stringify(nextState, null, 2)}\n`;
  const previousStateContent = await readTextIfExists(statePath);
  if (previousStateContent !== nextStateContent) {
    await fs.writeFile(statePath, nextStateContent, "utf8");
  }

  console.log(`Synced ${skill.name}`);
}

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(rootDir, absolutePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = path.relative(rootDir, absolutePath);
    files.push(relativePath.split(path.sep).join("/"));
  }

  return files.sort();
}

async function readJsonIfExists(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function removeEmptyParentDirs(startDir, stopDir) {
  let currentDir = startDir;
  const resolvedStopDir = path.resolve(stopDir);

  while (
    currentDir.startsWith(resolvedStopDir) &&
    path.resolve(currentDir) !== resolvedStopDir
  ) {
    const entries = await fs.readdir(currentDir);
    if (entries.length > 0) {
      return;
    }

    await fs.rmdir(currentDir);
    currentDir = path.dirname(currentDir);
  }
}

function parseArgs(argv) {
  const args = {
    help: false,
    skills: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }

    if (value === "--skill") {
      const skillName = argv[index + 1];
      if (!skillName) {
        throw new Error("Missing value for --skill");
      }
      args.skills.push(skillName);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-upstream-skills.mjs [--skill <name>]

Sync vendored upstream skills into this repository.

Options:
  --skill <name>  Sync only one named skill. Repeat the flag to sync multiple.
  -h, --help      Show this help message.
`);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code}`));
    });

    child.on("error", reject);
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
