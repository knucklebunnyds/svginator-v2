const fs = require('fs');
const path = require('path');
const { processFile } = require('./add-semantic-classes.js');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.svg')) {
            console.log(`\nProcessing: ${fullPath}`);
            processFile(fullPath);
        }
    }
}

// Start processing from traits directory
const traitsDir = path.join(process.cwd(), 'traits');
console.log('Starting to process all SVG files in traits directory...\n');
processDirectory(traitsDir); 