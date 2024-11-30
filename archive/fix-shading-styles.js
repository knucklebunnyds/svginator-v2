const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Semantic class definitions
const SEMANTIC_STYLES = {
    outline: {
        fill: '#000000',
        class: 'outline'
    },
    fill: {
        fill: '#ffffff',
        class: 'fill'
    },
    shading: {
        fill: '#aaaaaa',
        style: 'opacity: 0.5',
        class: 'shading'
    }
};

// Create backup directory with timestamp
async function createBackupDir() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, `traits_backup_${timestamp}`);
    await fs.promises.mkdir(backupDir, { recursive: true });
    return backupDir;
}

// Create backup of a file
async function backupFile(filePath, backupDir) {
    const relativePath = path.relative(path.join(__dirname, 'traits'), filePath);
    const backupPath = path.join(backupDir, relativePath);
    
    // Create necessary subdirectories
    await fs.promises.mkdir(path.dirname(backupPath), { recursive: true });
    
    // Copy file to backup location
    await fs.promises.copyFile(filePath, backupPath);
    return backupPath;
}

async function* getFiles(dir) {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory() && !dirent.name.startsWith('01_background')) {
            yield* getFiles(res);
        } else if (dirent.name.endsWith('.svg')) {
            yield res;
        }
    }
}

function getSemanticType($, element) {
    const $el = $(element);
    const id = $el.attr('id') || '';
    const className = $el.attr('class') || '';
    
    // Check ID prefix first
    for (const type of Object.keys(SEMANTIC_STYLES)) {
        if (id.startsWith(`${type}-`)) {
            return type;
        }
    }
    
    // Then check class
    for (const type of Object.keys(SEMANTIC_STYLES)) {
        if (className.includes(type)) {
            return type;
        }
    }
    
    return null;
}

async function fixSemanticStyles() {
    const traitsDir = path.join(__dirname, 'traits');
    const stats = {
        filesProcessed: 0,
        filesModified: 0,
        elementsByType: {
            outline: { fixed: 0, total: 0 },
            fill: { fixed: 0, total: 0 },
            shading: { fixed: 0, total: 0 }
        }
    };

    // Create backup directory
    console.log('\nCreating backup...');
    const backupDir = await createBackupDir();
    console.log(`Backup directory created: ${path.relative(__dirname, backupDir)}`);

    for await (const filePath of getFiles(traitsDir)) {
        // Create backup before processing file
        await backupFile(filePath, backupDir);
        
        let content = await fs.promises.readFile(filePath, 'utf8');
        const $ = cheerio.load(content, { xmlMode: true });
        let modified = false;

        // Process all path elements
        $('path').each((_, element) => {
            const $el = $(element);
            const semanticType = getSemanticType($, element);
            
            if (semanticType) {
                const style = SEMANTIC_STYLES[semanticType];
                stats.elementsByType[semanticType].total++;
                
                // Check and fix fill
                const currentFill = $el.attr('fill');
                if (currentFill !== style.fill) {
                    $el.attr('fill', style.fill);
                    modified = true;
                    stats.elementsByType[semanticType].fixed++;
                }
                
                // Check and fix class
                if (!$el.hasClass(style.class)) {
                    $el.addClass(style.class);
                    modified = true;
                }
                
                // Handle opacity for shading
                if (semanticType === 'shading') {
                    const currentStyle = $el.attr('style');
                    if (!currentStyle?.includes('opacity: 0.5')) {
                        $el.attr('style', style.style);
                        modified = true;
                    }
                } else {
                    // Remove opacity from non-shading elements
                    const currentStyle = $el.attr('style');
                    if (currentStyle?.includes('opacity')) {
                        $el.removeAttr('style');
                        modified = true;
                    }
                }
            }
        });

        if (modified) {
            await fs.promises.writeFile(filePath, $.html());
            console.log(`Updated ${path.relative(__dirname, filePath)}`);
            stats.filesModified++;
        }
        stats.filesProcessed++;
    }

    // Print summary
    console.log('\nProcessing complete!');
    console.log(`Backup created in: ${path.relative(__dirname, backupDir)}`);
    console.log(`Files processed: ${stats.filesProcessed}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log('\nElements processed:');
    for (const [type, counts] of Object.entries(stats.elementsByType)) {
        console.log(`${type}:`);
        console.log(`  Total: ${counts.total}`);
        console.log(`  Fixed: ${counts.fixed}`);
    }
}

fixSemanticStyles().catch(console.error); 