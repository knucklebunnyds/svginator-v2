const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configuration for expected patterns
const TRAIT_PATTERNS = {
    regular: {
        ids: {
            fill: 'fill-',
            shading: 'shading-',
            outline: 'outline-'
        },
        classes: ['fill', 'shading', 'outline'],
        colors: {
            fill: '#FFFFFF',
            shading: '#AAAAAA',
            outline: '#000000'
        },
        opacity: '0.5'
    },
    background: {
        classes: {
            svg: 'background',
            color: 'color',
            gradient: 'gradient'
        },
        idPrefixes: {
            color: 'color-',
            gradient: 'gradient-'
        }
    }
};

function getSvgFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            results = results.concat(getSvgFiles(fullPath));
        } else if (file.endsWith('.svg')) {
            results.push(fullPath);
        }
    }
    
    return results;
}

function isBackgroundTrait(filePath) {
    return filePath.includes('01_background');
}

function verifyAndFixRegularTrait(filePath, $) {
    console.log(`\nProcessing regular trait: ${path.basename(filePath)}`);
    let changes = [];

    // Get trait name from filename
    const traitName = path.basename(filePath, '.svg').toLowerCase();

    // Check and fix fill path
    const fillPath = $(`path[id^="fill-"]`);
    if (fillPath.length) {
        const currentId = fillPath.attr('id');
        const correctId = `fill-${traitName}`;
        if (currentId !== correctId) {
            fillPath.attr('id', correctId);
            changes.push(`Changed fill ID from ${currentId} to ${correctId}`);
        }
        if (!fillPath.hasClass('fill')) {
            fillPath.addClass('fill');
            changes.push('Added missing fill class');
        }
        if (fillPath.attr('fill') !== TRAIT_PATTERNS.regular.colors.fill) {
            fillPath.attr('fill', TRAIT_PATTERNS.regular.colors.fill);
            changes.push('Fixed fill color');
        }
    }

    // Check and fix shading path
    const shadingPath = $(`path[id^="shading-"]`);
    if (shadingPath.length) {
        const currentId = shadingPath.attr('id');
        const correctId = `shading-${traitName}`;
        if (currentId !== correctId) {
            shadingPath.attr('id', correctId);
            changes.push(`Changed shading ID from ${currentId} to ${correctId}`);
        }
        if (!shadingPath.hasClass('shading')) {
            shadingPath.addClass('shading');
            changes.push('Added missing shading class');
        }
        if (shadingPath.attr('fill') !== TRAIT_PATTERNS.regular.colors.shading) {
            shadingPath.attr('fill', TRAIT_PATTERNS.regular.colors.shading);
            changes.push('Fixed shading color');
        }
        // Fix opacity
        const style = shadingPath.attr('style') || '';
        if (!style.includes(`opacity: ${TRAIT_PATTERNS.regular.opacity}`)) {
            shadingPath.attr('style', `opacity: ${TRAIT_PATTERNS.regular.opacity}`);
            changes.push('Fixed shading opacity');
        }
    }

    // Check and fix outline path
    const outlinePath = $(`path[id^="outline-"]`);
    if (outlinePath.length) {
        const currentId = outlinePath.attr('id');
        const correctId = `outline-${traitName}`;
        if (currentId !== correctId) {
            outlinePath.attr('id', correctId);
            changes.push(`Changed outline ID from ${currentId} to ${correctId}`);
        }
        if (!outlinePath.hasClass('outline')) {
            outlinePath.addClass('outline');
            changes.push('Added missing outline class');
        }
        if (outlinePath.attr('fill') !== TRAIT_PATTERNS.regular.colors.outline) {
            outlinePath.attr('fill', TRAIT_PATTERNS.regular.colors.outline);
            changes.push('Fixed outline color');
        }
    }

    return changes;
}

function verifyAndFixBackgroundTrait(filePath, $) {
    console.log(`\nProcessing background: ${path.basename(filePath)}`);
    let changes = [];

    // Check root SVG element
    const svg = $('svg');
    if (!svg.hasClass('background')) {
        svg.addClass('background');
        changes.push('Added missing background class to SVG');
    }

    // Handle solid color backgrounds
    const colorPath = $('path[fill^="#"]');
    if (colorPath.length) {
        // Get color name from filename or existing ID
        const colorName = path.basename(filePath, '.svg').toLowerCase();
        const correctId = `color-${colorName}`;
        
        if (colorPath.attr('id') !== correctId) {
            colorPath.attr('id', correctId);
            changes.push(`Fixed color ID to ${correctId}`);
        }
        
        if (!colorPath.hasClass('color')) {
            colorPath.addClass('color');
            changes.push('Added missing color class');
        }

        // Remove duplicate fill in style attribute
        const fill = colorPath.attr('fill');
        if (fill && colorPath.attr('style')?.includes('fill:')) {
            colorPath.removeAttr('style');
            changes.push('Removed duplicate fill style');
        }
    }

    // Handle gradient backgrounds
    const gradientPath = $('path[fill^="url(#"]');
    if (gradientPath.length) {
        // Get gradient name from filename or existing ID
        const gradientName = path.basename(filePath, '.svg').toLowerCase();
        const correctId = `gradient-${gradientName}`;
        
        if (gradientPath.attr('id') !== correctId) {
            gradientPath.attr('id', correctId);
            changes.push(`Fixed gradient ID to ${correctId}`);
        }
        
        if (!gradientPath.hasClass('gradient')) {
            gradientPath.addClass('gradient');
            changes.push('Added missing gradient class');
        }

        // Remove duplicate fill in style attribute if it matches the fill attribute
        const fill = gradientPath.attr('fill');
        if (fill && gradientPath.attr('style')?.includes(fill)) {
            gradientPath.removeAttr('style');
            changes.push('Removed duplicate gradient fill style');
        }
    }

    return changes;
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content, { xmlMode: true });
    let changes = [];

    if (isBackgroundTrait(filePath)) {
        changes = verifyAndFixBackgroundTrait(filePath, $);
    } else {
        changes = verifyAndFixRegularTrait(filePath, $);
    }

    if (changes.length > 0) {
        console.log('Changes made:');
        changes.forEach(change => console.log(`  - ${change}`));
        fs.writeFileSync(filePath, $.html());
    } else {
        console.log('No changes needed');
    }

    return changes.length;
}

function main() {
    const traitsDir = path.join(process.cwd(), 'traits');
    const svgFiles = getSvgFiles(traitsDir);
    let totalChanges = 0;
    let filesChanged = 0;

    console.log('Starting trait structure verification...\n');

    svgFiles.forEach(file => {
        const changes = processFile(file);
        if (changes > 0) {
            filesChanged++;
            totalChanges += changes;
        }
    });

    console.log(`\nSummary:`);
    console.log(`Files processed: ${svgFiles.length}`);
    console.log(`Files changed: ${filesChanged}`);
    console.log(`Total changes made: ${totalChanges}`);
}

main(); 