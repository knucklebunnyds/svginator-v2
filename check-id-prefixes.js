const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Standard prefixes
const STANDARD_PREFIXES = ['fill-', 'outline-', 'shading-'];

// Function to check if a directory should be processed
function shouldProcessDirectory(dirName) {
    // Skip background directory as per project notes
    return dirName !== '01_background';
}

// Function to get all SVG files recursively
function getSvgFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (shouldProcessDirectory(file)) {
                results = results.concat(getSvgFiles(fullPath));
            }
        } else if (file.endsWith('.svg')) {
            results.push(fullPath);
        }
    }
    
    return results;
}

// Function to check if an ID has a standard prefix
function hasStandardPrefix(id) {
    return STANDARD_PREFIXES.some(prefix => id.startsWith(prefix));
}

// Function to analyze a single SVG file
function analyzeSvgFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content, { xmlMode: true });
    const nonStandardIds = [];
    
    // Find all elements with IDs
    $('[id]').each((_, element) => {
        const id = $(element).attr('id');
        if (!hasStandardPrefix(id)) {
            nonStandardIds.push(id);
        }
    });
    
    return nonStandardIds;
}

// Main function
function checkIdPrefixes() {
    const traitsDir = path.join(process.cwd(), 'traits');
    const svgFiles = getSvgFiles(traitsDir);
    const results = {};
    let totalNonStandard = 0;
    
    console.log('\nChecking SVG files for non-standard ID prefixes...\n');
    
    for (const file of svgFiles) {
        const relativePath = path.relative(process.cwd(), file);
        const nonStandardIds = analyzeSvgFile(file);
        
        if (nonStandardIds.length > 0) {
            results[relativePath] = nonStandardIds;
            totalNonStandard += nonStandardIds.length;
        }
    }
    
    // Print results
    if (Object.keys(results).length === 0) {
        console.log('✅ All IDs follow standard prefixes (fill-, outline-, shading-)');
    } else {
        console.log('Found non-standard ID prefixes in the following files:\n');
        
        for (const [file, ids] of Object.entries(results)) {
            console.log(`\n📁 ${file}:`);
            ids.forEach(id => console.log(`   - ${id}`));
        }
        
        console.log(`\nTotal non-standard IDs found: ${totalNonStandard}`);
    }
}

// Run the check
checkIdPrefixes(); 