const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function getSvgFiles(dir) {
    let results = [];
    // Get only the immediate children directories of /traits
    const traitCategories = fs.readdirSync(dir)
        .filter(file => {
            const fullPath = path.join(dir, file);
            return fs.statSync(fullPath).isDirectory();
        });
    
    // Process SVG files in each trait category directory
    for (const category of traitCategories) {
        const categoryPath = path.join(dir, category);
        const svgFiles = fs.readdirSync(categoryPath)
            .filter(file => file.endsWith('.svg'))
            .map(file => path.join(categoryPath, file));
        results = results.concat(svgFiles);
    }
    
    return results;
}

function analyzeSvgFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content, { xmlMode: true });
    const outlineShadingElements = [];
    
    // Find all elements with IDs containing 'outline-shading'
    $('[id^="outline-shading"]').each((_, element) => {
        const id = $(element).attr('id');
        const classes = $(element).attr('class') || '';
        const fill = $(element).attr('fill') || '';
        const style = $(element).attr('style') || '';
        
        outlineShadingElements.push({
            id,
            classes,
            fill,
            style
        });
    });
    
    return outlineShadingElements;
}

function checkOutlineShading() {
    const traitsDir = path.join(process.cwd(), 'traits');
    const svgFiles = getSvgFiles(traitsDir);
    const results = {};
    let totalFound = 0;
    
    console.log('\nChecking SVG files for outline-shading patterns...\n');
    
    for (const file of svgFiles) {
        const relativePath = path.relative(process.cwd(), file);
        const elements = analyzeSvgFile(file);
        
        if (elements.length > 0) {
            results[relativePath] = elements;
            totalFound += elements.length;
        }
    }
    
    // Print results
    if (Object.keys(results).length === 0) {
        console.log('✅ No outline-shading patterns found');
    } else {
        console.log('Found outline-shading patterns in these files:\n');
        
        for (const [file, elements] of Object.entries(results)) {
            console.log(`\n📁 ${file}:`);
            elements.forEach(element => {
                console.log(`   ID: ${element.id}`);
                console.log(`   Classes: ${element.classes}`);
                console.log(`   Fill: ${element.fill}`);
                console.log(`   Style: ${element.style}`);
                console.log('   ---');
            });
        }
        
        console.log(`\nTotal outline-shading elements found: ${totalFound}`);
    }
}

// Run the check
checkOutlineShading(); 