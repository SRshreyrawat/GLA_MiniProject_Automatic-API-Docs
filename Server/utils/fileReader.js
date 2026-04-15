const fs = require('fs').promises;
const path = require('path');

async function readFileContent(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }   
}

async function readFilesRecursive(dir, fileList = []) {
    const files = await fs.readdir(dir, { withFileTypes: true });
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            if (file.name !== 'node_modules' && !file.name.startsWith('.')) {
                await readFilesRecursive(fullPath, fileList);
            }
        } else if (file.name.endsWith('.js')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

module.exports = {
    readFileContent,
    readFilesRecursive
};  

