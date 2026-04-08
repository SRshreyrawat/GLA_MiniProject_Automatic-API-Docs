const fs = require('fs');
const path = require('path');

/**
 * Updates the README.md file at the specified targetPath.
 * targetPath is now MANDATORY to ensure zero-copy logic.
 */
function updateReadme(newDocs, targetPath) {
    if (!targetPath) {
        console.error("❌ Error: No targetPath provided to updateReadme. Zero-copy requires a specific path.");
        return;
    }

    try {
        if (!newDocs || newDocs.trim() === "") {
            console.log("⚠️ No docs to update.");
            return;
        }

        fs.writeFileSync(targetPath, newDocs);
        console.log(`✅ README.md updated at ${targetPath}`);
    } catch (err) {
        console.error("README update error:", err);
    }
}

module.exports = updateReadme;