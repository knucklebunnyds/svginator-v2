const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function getSvgFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== '01_background') {
            results = results.concat(getSvgFiles(fullPath));
        } else if (file.endsWith('.svg')) {
            results.push(fullPath);
        }
    }
    
    return results;
}

function findLayer1Files() {
    const traitsDir = path.join(process.cwd(), 'traits');
    const svgFiles = getSvgFiles(traitsDir);
    const layer1Files = [];
    
    console.log('\nChecking SVG files for Layer_1 IDs...\n');
    
    for (const file of svgFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content, { xmlMode: true });
        
        if ($('#Layer_1').length > 0) {
            const relativePath = path.relative(process.cwd(), file);
            layer1Files.push(relativePath);
        }
    }
    
    if (layer1Files.length === 0) {
        console.log('✅ No files found with Layer_1 IDs');
    } else {
        console.log('Found Layer_1 IDs in these files:\n');
        layer1Files.forEach(file => console.log(`📁 ${file}`));
        console.log(`\nTotal files with Layer_1 IDs: ${layer1Files.length}`);
    }
}

findLayer1Files(); 