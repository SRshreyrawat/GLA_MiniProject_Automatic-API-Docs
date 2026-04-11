const chokidar = require('chokidar');
const path = require('path');
const { readFileContent, readFilesRecursive } = require('../utils/fileReader');
const generateDocs = require('../ai/geminiservice');
const updateReadme = require('../utils/readmeUpdater');
const fs = require('fs');

let watcherInstance = null;
let timeout = null;

// Rate Limit Protection State
let isGenerating = false;
let lastGenerationTime = 0;
const COOLDOWN_PERIOD = 10000; // 30 seconds (Max 2 updates per minute)

async function startWatcher(targetPath) {
    if (watcherInstance) {
        console.log("Closing previous watcher...");
        watcherInstance.close();
    }

    console.log(`\n\n[Live Tracker] Initializing recursive watch for: ${targetPath}`);
    
    watcherInstance = chokidar.watch(targetPath, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            /node_modules/,
            /README\.md/,
            /endpoints\.json/
        ],
        persistent: true,
        ignoreInitial: true
    });

    console.log("---------------------------------------------------------");
    console.log(`🚀 LIVE TRACKER ACTIVE: ${targetPath}`);
    console.log(`🛡️  RATE LIMIT PROTECTION: 30s Cooldown Active`);
    console.log("---------------------------------------------------------");

    watcherInstance.on('all', (event, filePath) => {
        const relativePath = path.relative(targetPath, filePath);
        
        // Skip if currently generating to prevent queue buildup
        if (isGenerating) return;

        // Skip if still in cooldown period
        const now = Date.now();
        const timeSinceLastUpdate = now - lastGenerationTime;
        if (timeSinceLastUpdate < COOLDOWN_PERIOD) {
            const remaining = Math.ceil((COOLDOWN_PERIOD - timeSinceLastUpdate) / 1000);
            // Throttle logging the cooldown message
            if (!timeout) {
                 console.log(`\n[CHANGE] ${relativePath} (Cooldown Active: Next update in ${remaining}s)`);
            }
        } else {
             console.log(`\n[${event.toUpperCase()}] ${relativePath}`);
        }

        // Debounce documentation generation
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            const startTime = Date.now();
            const elapsed = startTime - lastGenerationTime;

            if (elapsed < COOLDOWN_PERIOD) {
                const wait = COOLDOWN_PERIOD - elapsed;
                console.log(`⏳ Waiting ${Math.ceil(wait / 1000)}s more to respect 15 RPM rate limit...`);
                // Reschedule for after cooldown
                timeout = setTimeout(() => watcherInstance.emit('change', filePath), wait);
                return;
            }

            console.log("🔄 Changes detected. Re-analyzing project tree...");
            isGenerating = true;

            try {
                // Recursive scan for documentation files
                const projectFiles = await readFilesRecursive(targetPath);
                let combinedCode = "";

                for (let file of projectFiles) {
                    const content = fs.readFileSync(file, 'utf-8');
                    if (!content) continue;
                    combinedCode += `\n// File: ${path.relative(targetPath, file)}\n${content}\n`;
                }

                if (combinedCode.trim() === "") {
                    console.log("⚠️ No relevant code found to document.");
                    isGenerating = false;
                    return;
                }

                console.log(`💎 AI is re-generating documentation for ${projectFiles.length} files...`);
                const response = await generateDocs(combinedCode);

                const readmePath = path.join(targetPath, 'README.md');
                updateReadme(response.readme, readmePath);

                const endpointsPath = path.join(targetPath, 'endpoints.json');
                fs.writeFileSync(endpointsPath, JSON.stringify(response.endpoints, null, 2));
                
                lastGenerationTime = Date.now();
                console.log("✅ LIVE UPDATE COMPLETE.");
                console.log(`🕒 Next update allowed after 30 seconds.`);
                console.log("---------------------------------------------------------");

            } catch (err) {
                console.error("❌ ERROR during background update:", err);
            } finally {
                isGenerating = false;
                timeout = null;
            }

        }, 5000); // Increased debounce to 5 seconds for more natural batching
    });

    watcherInstance.on('error', error => console.log(`[Watcher Error]: ${error}`));
}

module.exports = { startWatcher };
