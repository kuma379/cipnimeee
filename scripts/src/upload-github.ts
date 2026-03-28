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
  ".DS_Store",
  "Thumbs.db",
  "pnpm-lock.yaml",
]);

const IGNORE_EXTENSIONS = new Set([
  ".log",
  ".map",
]);

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg",
  ".woff", ".woff2", ".ttf", ".eot",
  ".pdf", ".zip", ".gz",
]);

function getAllFiles(dir: string, results: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && IGNORE_DIRS.has(entry.name)) continue;
    if (!entry.name.startsWith(".") && IGNORE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        getAllFiles(fullPath, results);
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (!IGNORE_FILES.has(entry.name) && !IGNORE_EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function getLatestCommitSha(): Promise<string> {
  const res = await api.get(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  return (res.data as { object: { sha: string } }).object.sha;
}

async function getBaseTreeSha(commitSha: string): Promise<string> {
  const res = await api.get(`/repos/${OWNER}/${REPO}/git/commits/${commitSha}`);
  return (res.data as { tree: { sha: string } }).tree.sha;
}

async function createBlob(content: Buffer, isBinary: boolean): Promise<string> {
  const res = await api.post(`/repos/${OWNER}/${REPO}/git/blobs`, {
    content: content.toString(isBinary ? "base64" : "base64"),
    encoding: "base64",
  });
  return (res.data as { sha: string }).sha;
}

interface TreeEntry {
  path: string;
  mode: "100644";
  type: "blob";
  sha: string;
}

async function main() {
  console.log(`📦 Uploading project to github.com/${OWNER}/${REPO}...`);
  console.log(`📁 Root: ${ROOT}\n`);

  const files = getAllFiles(ROOT);
  console.log(`Found ${files.length} files to upload\n`);

  // Get current commit and tree
  const latestCommitSha = await getLatestCommitSha();
  const baseTreeSha = await getBaseTreeSha(latestCommitSha);
  console.log(`Current commit: ${latestCommitSha}\n`);

  // Create blobs for all files (in batches of 10 to avoid rate limiting)
  const treeEntries: TreeEntry[] = [];
  const BATCH = 5;

  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map(async (absPath) => {
        const relPath = path.relative(ROOT, absPath).replace(/\\/g, "/");
        const ext = path.extname(absPath).toLowerCase();
        const isBinary = BINARY_EXTENSIONS.has(ext);

        try {
          const content = fs.readFileSync(absPath);
          const blobSha = await createBlob(content, isBinary);
          console.log(`  ✓ blob: ${relPath}`);
          return { path: relPath, mode: "100644" as const, type: "blob" as const, sha: blobSha };
        } catch (err: unknown) {
          if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const msg = err.response?.data?.message || err.message;
            if (status === 403 || status === 429) {
              console.log(`  ✗ blob rate-limited (${status}): ${relPath} — ${msg}`);
            } else {
              console.log(`  ✗ blob failed (${status}): ${relPath} — ${msg}`);
            }
          } else {
            console.log(`  ✗ blob failed: ${relPath}`);
          }
          return null;
        }
      })
    );

    for (const result of batchResults) {
      if (result) treeEntries.push(result);
    }

    // Delay between batches to avoid rate limiting
    if (i + BATCH < files.length) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  console.log(`\nCreating tree with ${treeEntries.length} entries...`);

  // Create a new tree
  const treeRes = await api.post(`/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: treeEntries,
  });
  const newTreeSha = (treeRes.data as { sha: string }).sha;
  console.log(`Tree SHA: ${newTreeSha}`);

  // Create a commit
  const commitRes = await api.post(`/repos/${OWNER}/${REPO}/git/commits`, {
    message: "Upload CipNime project",
    tree: newTreeSha,
    parents: [latestCommitSha],
  });
  const newCommitSha = (commitRes.data as { sha: string }).sha;
  console.log(`Commit SHA: ${newCommitSha}`);

  // Update branch ref
  await api.patch(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: newCommitSha,
    force: true,
  });

  console.log("\n✅ Upload complete!");
  console.log(`🔗 https://github.com/${OWNER}/${REPO}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
