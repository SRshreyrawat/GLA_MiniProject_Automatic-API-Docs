const fs = require('fs');
const path = require('path');

const generateDocs = require('./ai/geminiservice');
const updateReadme = require('./utils/readmeUpdater');

const PROJECTS_PATH = path.join(__dirname, '../projects');

async function processFiles(target, customFilesContext) {
    try {
        if (customFilesContext && customFilesContext.length > 0) {
            console.log(`\n📂 Processing ${customFilesContext.length} custom files...`);
            
            for (let i = 0; i < customFilesContext.length; i++) {
                let fileCtx = customFilesContext[i];
                console.log(`\n📂 [${i+1}/${customFilesContext.length}] Generating docs for custom file ${fileCtx.fileName}...`);
                
                try {
                    const docs = await generateDocs(fileCtx.fileContent);
                    console.log("📘 Generated Docs successfully.");
                    updateReadme(docs);
                } catch (apiError) {
                    console.log(`⚠️ Gemini API failed: ${apiError.message}`);
                    console.log("Waiting 30 seconds before continuing to respect Rate Limits...");
                    await new Promise(resolve => setTimeout(resolve, 30000));
                    
              
                    try {
                        const docs = await generateDocs(fileCtx.fileContent);
                        console.log(" Generated Docs on retry successfully.");
                        updateReadme(docs);
                    } catch(retryErr) {
                        console.log(` Skipping ${fileCtx.fileName} due to persistent error.`);
                    }
                }

                
                if (i < customFilesContext.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            return;
        }

        let filesToProcess = [];

        if (target) {
            const targetPath = path.join(PROJECTS_PATH, target);
            if (fs.existsSync(targetPath)) {
                if (fs.statSync(targetPath).isDirectory()) {
                    filesToProcess = fs.readdirSync(targetPath)
                        .map(f => path.join(target, f)); 
                } else {
                    filesToProcess = [target];
                }
            }
        } else {
            filesToProcess = fs.readdirSync(PROJECTS_PATH);
        }

        for (let file of filesToProcess) {
            const filePath = path.join(PROJECTS_PATH, file);
            
            if (fs.statSync(filePath).isFile() && file.endsWith('.js')) {
                console.log(`\n📂 Processing ${file}...`);

                const content = fs.readFileSync(filePath, 'utf-8');

                const docs = await generateDocs(content);

                console.log("📘 Generated Docs:");
                console.log(docs);

                updateReadme(docs);
            }
        }
    } catch (err) {
        console.error("❌ Error:", err);
    }
}
module.exports =  processFiles 
