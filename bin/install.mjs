#!/usr/bin/env node
import { cp, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const skillName = "roteiro-insercoes-web";

const defaults = {
  codex: join(homedir(), ".codex", "skills", skillName),
  claude: join(homedir(), ".claude", "skills", skillName),
  gemini: join(homedir(), ".gemini", "skills", skillName)
};

function parseArgs(argv) {
  const args = { agent: "codex", force: false, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const item = argv[i];
    if (item === "--force") args.force = true;
    else if (item === "--dry-run") args.dryRun = true;
    else if (item === "--agent") args.agent = argv[++i];
    else if (item.startsWith("--agent=")) args.agent = item.slice("--agent=".length);
    else if (item === "--target") args.target = argv[++i];
    else if (item.startsWith("--target=")) args.target = item.slice("--target=".length);
    else if (item === "--help" || item === "-h") args.help = true;
  }
  return args;
}

function help() {
  console.log(`
Install roteiro-insercoes-web skill.

Usage:
  npx github:Sa-Meneses/roteiro-insercoes-web --agent codex
  npx github:Sa-Meneses/roteiro-insercoes-web --agent claude
  npx github:Sa-Meneses/roteiro-insercoes-web --agent gemini
  npx github:Sa-Meneses/roteiro-insercoes-web --agent all
  npx github:Sa-Meneses/roteiro-insercoes-web --target ~/.codex/skills/roteiro-insercoes-web

Options:
  --agent codex|claude|gemini|all  Target local skills directory. Default: codex.
  --target <path>                  Install to a custom directory.
  --force                          Replace an existing installation.
  --dry-run                        Print planned install paths without writing.
`);
}

async function copySkill(target, { force, dryRun, agent }) {
  target = target.replace(/^~(?=$|\/)/, homedir());
  const finalTarget = resolve(target);
  if (dryRun) {
    console.log(`[dry-run] ${skillName} -> ${finalTarget}`);
    return;
  }
  if (existsSync(finalTarget)) {
    if (!force) {
      throw new Error(`${finalTarget} already exists. Re-run with --force to replace it:\n  npx github:Sa-Meneses/roteiro-insercoes-web --agent ${agent || "codex"} --force`);
    }
    await rm(finalTarget, { recursive: true, force: true });
  }
  await mkdir(finalTarget, { recursive: true });
  for (const entry of ["SKILL.md", "agents", "references", "scripts"]) {
    const src = join(root, entry);
    try {
      await stat(src);
      await cp(src, join(finalTarget, entry), { recursive: true });
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  console.log(`Installed ${skillName} -> ${finalTarget}`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    help();
    return;
  }

  let targets;
  if (args.target) {
    targets = [args.target];
  } else if (args.agent === "all") {
    targets = Object.values(defaults);
  } else if (defaults[args.agent]) {
    targets = [defaults[args.agent]];
  } else {
    throw new Error(`Unknown --agent "${args.agent}". Use codex, claude, gemini, all, or --target.`);
  }

  for (const target of targets) {
    await copySkill(target, args);
  }
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
