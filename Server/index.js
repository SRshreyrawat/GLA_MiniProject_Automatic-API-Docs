require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { startWatcher } = require('./watcher/fileWatcher');
const { readFileContent, readFilesRecursive } = require('./utils/fileReader');
const generateDocs = require('./ai/geminiservice');
const updateReadme = require('./utils/readmeUpdater');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Utility to list all drives on Windows (C:, D:, E:, etc.)
const getDrives = () => {
    return new Promise((resolve) => {
        if (process.platform !== 'win32') return resolve([]);
        const { exec } = require('child_process');
        
        // Try WMIC first
        exec('wmic logicaldisk get name', (err, stdout) => {
            let drives = [];
            if (!err && stdout) {
                drives = stdout.split('\r\n')
                    .filter(value => /[A-Za-z]:/.test(value))
                    .map(value => value.trim());
            }

            // Fallback: Manually check A-Z if WMIC failed or was incomplete
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const fallbackDrives = [];
            alphabet.split("").forEach(letter => {
                const drivePath = `${letter}:\\`;
                try {
                    if (fs.existsSync(drivePath)) {
                        fallbackDrives.push(`${letter}:`);
                    }
                } catch (e) { /* ignore access errors */ }
            });

            // Use the most complete list found
            const finalDrives = [...new Set([...drives, ...fallbackDrives])].sort();
            resolve(finalDrives.length > 0 ? finalDrives : ['C:']);
        });
    });
};

// Endpoint to explore local file system
app.get('/explorer', async (req, res) => {
    let currentPath = req.query.path || "";
    
    try {
        if (currentPath === "") {
            // Root - Show all drives on Windows or '/' on Linux/Mac
            if (process.platform === 'win32') {
                const drives = await getDrives();
                return res.json({ 
                    currentPath: "", 
                    isRoot: true,
                    folders: drives.map(d => ({ name: d, path: d + '\\', isDrive: true })) 
                });
            } else {
                currentPath = '/';
            }
        }

        if (!fs.existsSync(currentPath)) {
            return res.status(404).json({ error: "Path does not exist" });
        }

        const items = fs.readdirSync(currentPath, { withFileTypes: true });
        const folders = items
            .filter(item => item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules')
            .map(item => ({
                name: item.name,
                path: path.join(currentPath, item.name)
            }));

        res.json({ 
            currentPath, 
            isRoot: currentPath === (process.platform === 'win32' ? "" : "/"),
            folders,
            parentPath: path.dirname(currentPath) === currentPath ? "" : path.dirname(currentPath)
        });
    } catch (err) {
        console.error("Explorer error:", err);
        res.status(500).json({ error: "Failed to read directory" });
    }
});

app.get('/', (req, res) => {
  res.send('OpenDocs AI running');
});

app.get('/endpoints', (req, res) => {
    const { path: targetPath } = req.query;
    if (!targetPath) return res.status(400).json({ error: "No path provided" });

    const endpointsPath = path.join(targetPath, 'endpoints.json');
    try {
        if (fs.existsSync(endpointsPath)) {
            const data = fs.readFileSync(endpointsPath, 'utf-8');
            return res.json({ endpoints: JSON.parse(data) });
        }
        res.json({ endpoints: [] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read endpoints' });
    }
})

app.get('/readme', (req, res) => {
    const { path: targetPath } = req.query;
    if (!targetPath) return res.status(400).json({ error: "No path provided" });

    const readmePath = path.join(targetPath, 'README.md');
    try {
        if (fs.existsSync(readmePath)) {
            const data = fs.readFileSync(readmePath, 'utf-8');
            return res.json({ content: data });
        }
        res.json({ content: "" });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read README' });
    }
})

// Endpoint to start tracking a specific local project path
app.post('/track-project', async (req, res) => {
    const { targetPath } = req.body || {};
    
    if (!targetPath || !fs.existsSync(targetPath)) {
        return res.status(400).json({ error: 'Invalid path provided. Path does not exist.' });
    }

    try {
        console.log(`Setting up tracker for: ${targetPath}`);
        // Start watching this folder
        startWatcher(targetPath);

        // Perform an initial documentation generation for the README
        const projectFiles = await readFilesRecursive(targetPath);
        let combinedCode = "";
        for (let file of projectFiles) {
            const content = await readFileContent(file);
            if (!content) continue;
            combinedCode += `\n// File: ${path.relative(targetPath, file)}\n${content}\n`;
        }

        if (combinedCode.trim() !== "") {
            console.log("Generating initial documentation...");
            const response = await generateDocs(combinedCode);
            const readmePath = path.join(targetPath, 'README.md');
            updateReadme(response.readme, readmePath);
            
            // Save endpoints to disk
            const endpointsPath = path.join(targetPath, 'endpoints.json');
            fs.writeFileSync(endpointsPath, JSON.stringify(response.endpoints, null, 2));
            
            return res.json({ 
                success: true,
                message: `Now tracking project at ${targetPath}. Initial README generated.`, 
                readmePath: path.join(targetPath, 'README.md'),
                endpoints: response.endpoints
            });
        }

        res.json({ 
            success: true,
            message: `Now tracking project at ${targetPath}. Initial README generated.`, 
            readmePath: path.join(targetPath, 'README.md'),
            endpoints: []
        });
    } catch (err) {
        console.error("Tracking error:", err);
        res.status(500).json({ error: 'Failed to track project' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});