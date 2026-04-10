#!/usr/bin/env node

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const skillsRoot = path.join(repoRoot, "skills");
const stateFileName = ".niuge-skill-sync.json";
const ignoredFileNames = new Set([stateFileName, ".upstream-sync.json"]);

const toolInstallDirs = {
  claude: path.join(".claude", "skills"),
  codex: path.join(".codex", "skills"),
  cursor: path.join(".cursor", "skills"),
};

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  const availableSkills = await getAvailableSkills();

  if (args.list) {
    console.log(availableSkills.join("\n"));
    return;
  }

  const selectedSkills = args.skills.length > 0 ? args.skills : availableSkills;
  const missingSkills = selectedSkills.filter(
    (name) => !availableSkills.includes(name),
  );

  if (missingSkills.length > 0) {
    throw new Error(`Unknown skill name(s): ${missingSkills.join(", ")}`);
  }

  const targetRoot = resolveTargetRoot(args.target);
  if (path.resolve(targetRoot) === repoRoot) {
    throw new Error(
      "Refusing to install into the niuge-skills repo itself. Pass --target <project-path> or run the script from the target project directory.",
    );
  }

  const targetSkillsRoot = path.join(targetRoot, toolInstallDirs[args.tool]);
  await fs.mkdir(targetSkillsRoot, { recursive: true });

  for (const skillName of selectedSkills) {
    const sourceDir = path.join(skillsRoot, skillName);
    const destinationDir = path.join(targetSkillsRoot, skillName);
    await syncSkill({
      skillName,
      sourceDir,
      destinationDir,
      tool: args.tool,
    });
  }
}

async function getAvailableSkills() {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillDir = path.join(skillsRoot, entry.name);
    const skillFile = path.join(skillDir, "SKILL.md");

    if (await fileExists(skillFile)) {
      skills.push(entry.name);
    }
  }

  return skills.sort();
}

async function syncSkill({ skillName, sourceDir, destinationDir, tool }) {
  const managedFiles = await listFiles(sourceDir);
  const statePath = path.join(destinationDir, stateFileName);
  const previousState = await readJsonIfExists(statePath);
  const previousManagedFiles = previousState?.managedFiles ?? [];

  await fs.mkdir(destinationDir, { recursive: true });

  const currentFiles = new Set(managedFiles);
  const staleFiles = previousManagedFiles.filter(
    (relativePath) => !currentFiles.has(relativePath),
  );

  for (const relativePath of staleFiles) {
    const destinationPath = path.join(destinationDir, ...relativePath.split("/"));
    await fs.rm(destinationPath, { force: true });
    await removeEmptyParentDirs(path.dirname(destinationPath), destinationDir);
  }

  for (const relativePath of managedFiles) {
    const sourcePath = path.join(sourceDir, ...relativePath.split("/"));
    const destinationPath = path.join(destinationDir, ...relativePath.split("/"));
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }

  const nextState = {
    tool,
    sourceDir,
    managedFiles,
    syncedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    statePath,
    `${JSON.stringify(nextState, null, 2)}\n`,
    "utf8",
  );

  console.log(`Installed ${skillName} -> ${destinationDir}`);
}

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredFileNames.has(entry.name)) {
      continue;
    }

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

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
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

function resolveTargetRoot(target) {
  if (!target) {
    return process.cwd();
  }

  if (target === "~") {
    return os.homedir();
  }

  if (target.startsWith(`~${path.sep}`) || target.startsWith("~/")) {
    return path.join(os.homedir(), target.slice(2));
  }

  return path.resolve(process.cwd(), target);
}

function parseArgs(argv) {
  const args = {
    help: false,
    list: false,
    skills: [],
    target: "",
    tool: "cursor",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    if (value === "--help" || value === "-h") {
      args.help = true;
      continue;
    }

    if (value === "--list") {
      args.list = true;
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

    if (value === "--target") {
      const target = argv[index + 1];
      if (!target) {
        throw new Error("Missing value for --target");
      }
      args.target = target;
      index += 1;
      continue;
    }

    if (value === "--tool") {
      const tool = argv[index + 1];
      if (!tool) {
        throw new Error("Missing value for --tool");
      }

      if (!(tool in toolInstallDirs)) {
        throw new Error(`Unknown tool: ${tool}`);
      }

      args.tool = tool;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${value}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/install-local-skills.mjs [options]

Install one or more local skills from this repository into another project.

Options:
  --skill <name>   Install only one named skill. Repeat the flag to install multiple.
  --tool <name>    Target tool directory: cursor (default), codex, claude.
  --target <path>  Target project path. Defaults to the current working directory.
  --list           Print available local skills and exit.
  -h, --help       Show this help message.
`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
