const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");

const { readFilesRecursive } = require("../utils/fileReader");
const generateDocs = require("../ai/geminiService");
const updateReadme = require("../utils/readmeUpdater");

/* =========================
   🔹 CONFIG
========================= */

const VALID_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx", ".json"];
const MAX_FILE_SIZE = 200 * 1024; // 200KB
const COOLDOWN_PERIOD = 10000; // 10s

/* =========================
   🔹 STATE
========================= */

let watcherInstance = null;
let timeout = null;
let isGenerating = false;
let lastGenerationTime = 0;

let stats = {
  totalRuns: 0,
  filesProcessed: 0,
  lastRunDuration: 0,
};

/* =========================
   🔹 HELPERS
========================= */

function isValidFile(file) {
  return VALID_EXTENSIONS.includes(path.extname(file));
}

function isFileSizeValid(file) {
  try {
    const stats = fs.statSync(file);
    return stats.size <= MAX_FILE_SIZE;
  } catch {
    return false;
  }
}

/* 🔹 Logging */
function logInfo(msg) {
  console.log(`ℹ️ ${msg}`);
}

function logSuccess(msg) {
  console.log(`✅ ${msg}`);
}

function logError(msg, err) {
  console.error(`❌ ${msg}`, err);
}

/* =========================
   🔹 CORE GENERATION LOGIC
========================= */

async function generateDocumentation(targetPath) {
  const startTime = Date.now();
  stats.totalRuns++;

  try {
    logInfo("Scanning project files...");

    const projectFiles = await readFilesRecursive(targetPath);
    let combinedCode = "";

    for (let file of projectFiles) {
      if (!isValidFile(file)) continue;
      if (!isFileSizeValid(file)) {
        logInfo(`Skipping large file: ${file}`);
        continue;
      }

      const content = fs.readFileSync(file, "utf-8");
      if (!content) continue;

      combinedCode += `\n// File: ${path.relative(targetPath, file)}\n${content}\n`;
    }

    if (!combinedCode.trim()) {
      logInfo("No valid code found.");
      return;
    }

    stats.filesProcessed = projectFiles.length;

    logInfo(`Generating docs for ${stats.filesProcessed} files...`);

    const response = await generateDocs(combinedCode);

    updateReadme(response.readme, path.join(targetPath, "README.md"));

    fs.writeFileSync(
      path.join(targetPath, "endpoints.json"),
      JSON.stringify(response.endpoints, null, 2)
    );

    stats.lastRunDuration = Date.now() - startTime;

    logSuccess("Documentation updated successfully");

    console.log(
      `📊 Stats → Runs: ${stats.totalRuns}, Files: ${stats.filesProcessed}, Time: ${stats.lastRunDuration}ms`
    );
  } catch (err) {
    logError("Generation failed", err);

    if (err.message && err.message.includes("rate")) {
      console.log("⚠️ Rate limit hit. Retrying later...");
    }
  }
}

/* =========================
   🔹 WATCHER
========================= */

async function startWatcher(targetPath) {
  if (watcherInstance) {
    logInfo("Closing previous watcher...");
    watcherInstance.close();
  }

  logInfo(`Starting watcher on: ${targetPath}`);

  watcherInstance = chokidar.watch(targetPath, {
    ignored: [
      /(^|[\/\\])\../,
      /node_modules/,
      /README\.md/,
      /endpoints\.json/,
    ],
    persistent: true,
    ignoreInitial: true,
  });

  console.log("--------------------------------------------------");
  console.log(`🚀 LIVE TRACKER ACTIVE`);
  console.log(`🛡️ Cooldown: ${COOLDOWN_PERIOD / 1000}s`);
  console.log("--------------------------------------------------");

  watcherInstance.on("all", (event, filePath) => {
    const relativePath = path.relative(targetPath, filePath);

    if (isGenerating) return;

    const now = Date.now();
    const elapsed = now - lastGenerationTime;

    if (elapsed < COOLDOWN_PERIOD) {
      const remaining = Math.ceil((COOLDOWN_PERIOD - elapsed) / 1000);
      if (!timeout) {
        console.log(`⏳ Cooldown (${remaining}s) → ${relativePath}`);
      }
      return;
    }

    console.log(`\n[${event.toUpperCase()}] ${relativePath}`);

    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      isGenerating = true;

      await generateDocumentation(targetPath);

      lastGenerationTime = Date.now();
      isGenerating = false;
      timeout = null;
    }, 5000);
  });

  watcherInstance.on("error", (err) =>
    logError("Watcher error", err)
  );
}

/* =========================
   🔹 MANUAL TRIGGER
========================= */

async function triggerManualUpdate(targetPath) {
  logInfo("Manual trigger started...");
  await generateDocumentation(targetPath);
}

/* =========================
   🔹 EXPORTS
========================= */

module.exports = {
  startWatcher,
  triggerManualUpdate,
};