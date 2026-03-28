import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const OWNER = "kuma379";
const REPO = "cipnimeee";
const BRANCH = "main";
const TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!TOKEN) {
  throw new Error("GITHUB_PERSONAL_ACCESS_TOKEN is required");
}

const api = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..", "..");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".cache",
  ".upm",
  ".config",
  ".local",
  "attached_assets",
  ".replit-artifact",
]);

const IGNORE_FILES = new Set([
  ".replit",
  "replit.nix",
  "pnpm-lock.yaml",
  ".DS_Store",
]);

const IGNORE_EXTENSIONS = new Set([
  ".tsbuildinfo",
]);

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  for (const part of parts) {
    if (IGNORE_DIRS.has(part)) return true;
  }
  const basename = path.basename(filePath);
  if (IGNORE_FILES.has(basename)) return true;
  const ext = path.extname(filePath);
  if (IGNORE_EXTENSIONS.has(ext)) return true;
  return false;
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const results: string[] = [];
  
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    
    if (shouldIgnore(relPath)) continue;
    
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  
  return results;
}

async function getFileSha(filePath: string): Promise<string | null> {
  try {
    const res = await api.get(`/repos/${OWNER}/${REPO}/contents/${filePath}`, {
      params: { ref: BRANCH },
    });
    return (res.data as { sha: string }).sha;
  } catch {
    return null;
  }
}

async function uploadFile(absolutePath: string, retryWithSha?: string): Promise<void> {
  const relPath = path.relative(ROOT, absolutePath).replace(/\\/g, "/");
  
  let content: string;
  try {
    const buf = fs.readFileSync(absolutePath);
    content = buf.toString("base64");
  } catch {
    console.log(`  ⚠ Skipped (unreadable): ${relPath}`);
    return;
  }

  const sha = retryWithSha ?? await getFileSha(relPath);

  try {
    await api.put(`/repos/${OWNER}/${REPO}/contents/${relPath}`, {
      message: `Upload ${relPath}`,
      content,
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    });
    console.log(`  ✓ ${relPath}`);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg = err.response?.data?.message || err.message;
      // GitHub returns "is at <actual_sha> but expected <our_sha>" on conflict
      const match = msg.match(/is at ([0-9a-f]{40}) but expected/);
      if (match && !retryWithSha) {
        // Retry with the correct SHA
        await uploadFile(absolutePath, match[1]);
      } else {
        console.log(`  ✗ ${relPath}: ${msg}`);
      }
    } else {
      console.log(`  ✗ ${relPath}: Unknown error`);
    }
  }
}

async function main() {
  console.log(`📦 Uploading project to github.com/${OWNER}/${REPO}...`);
  console.log(`📁 Root: ${ROOT}\n`);

  const files = getAllFiles(ROOT);
  console.log(`Found ${files.length} files to upload\n`);

  // Upload sequentially to avoid SHA conflicts
  for (const file of files) {
    await uploadFile(file);
  }

  console.log("\n✅ Upload complete!");
  console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
