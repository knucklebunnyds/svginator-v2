const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function cleanAdobeArtifacts(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content, { xmlMode: true });

    // Remove Adobe namespace
    const svg = $('svg');
    const xmlns = svg.attr('xmlns:i');
    if (xmlns && xmlns.includes('adobe')) {
        svg.removeAttr('xmlns:i');
    }

    // Remove Adobe metadata
    $('metadata').each((_, elem) => {
        const metadata = $(elem);
        metadata.find('i\\:aipgfRef, i\\:aipgf').remove();
        // If metadata is empty after removing Adobe tags, remove the whole metadata tag
        if (!metadata.children().length) {
            metadata.remove();
        }
    });

    // Write cleaned file
    const cleanedContent = $.xml();
    fs.writeFileSync(filePath, cleanedContent, 'utf-8');
    
    console.log(`Cleaned Adobe artifacts from ${path.basename(filePath)}`);
}

// Clean the three files
const filesToClean = [
    'traits/05_Right Ear/KBDS tattoo.svg',
    'traits/06_Left Ear/KBDS tattoo.svg',
    'traits/06_Left Ear/battle scars.svg'
];

filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
        cleanAdobeArtifacts(file);
    } else {
        console.log(`File not found: ${file}`);
    }
}); 