const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Standard prefixes (case sensitive)
const STANDARD_PREFIXES = ['fill-', 'outline-', 'shading-'];

// Semantic prefixes with any case
const SEMANTIC_PATTERN = /^(fill|outline|shading)-/i;

// Adobe patterns
const ADOBE_PATTERNS = [
    /adobe_illustrator_pgf/i,
    /^st\d+/i,  // st0, st1, etc.
    /^adobe/i
];

// Files we've already cleared
const CLEARED_FILES = [
    'traits/02_Jaw/OG.svg',
    'traits/02_Jaw/headphones.svg',
    'traits/05_Right Ear/KBDS tattoo.svg',
    'traits/06_Left Ear/KBDS tattoo.svg',
    'traits/06_Left Ear/battle scars.svg'
];

// Valid top-level IDs (trait names, etc.)
const VALID_TOP_LEVEL = [
    'navigators',
    'glasses',
    'horns',
    'joint',
    'stogie',
    'left-ear-notched',
    'right-ear-notched'
];

function getSvgFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== '01_background') {
            results = results.concat(getSvgFiles(fullPath));
        } else if (file.endsWith('.svg')) {
            // Skip files we've already cleared
            if (!CLEARED_FILES.includes(fullPath)) {
                results.push(fullPath);
            }
        }
    }
    
    return results;
}

function analyzeId(id) {
    // Skip valid top-level IDs
    if (VALID_TOP_LEVEL.includes(id)) {
        return null;
    }

    // Check for Adobe patterns
    for (const pattern of ADOBE_PATTERNS) {
        if (pattern.test(id)) {
            return {
                id,
                category: 'Adobe Artifact',
                issue: 'Contains Adobe-specific identifier'
            };
        }
    }

    // Check for semantic prefixes with wrong case
    if (SEMANTIC_PATTERN.test(id) && !STANDARD_PREFIXES.some(prefix => id.startsWith(prefix))) {
        return {
            id,
            category: 'Case Mismatch',
            issue: 'Semantic prefix with incorrect case'
        };
    }

    // Check for non-semantic IDs (excluding Layer_1 which we've handled)
    if (!id.startsWith('fill-') && !id.startsWith('outline-') && !id.startsWith('shading-') && id !== 'Layer_1') {
        return {
            id,
            category: 'Non-Standard',
            issue: 'ID does not follow semantic naming convention'
        };
    }

    return null;
}

function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(content, { xmlMode: true });
    const issues = [];
    
    $('[id]').each((_, element) => {
        const id = $(element).attr('id');
        const analysis = analyzeId(id);
        if (analysis) {
            issues.push(analysis);
        }
    });
    
    return issues;
}

function analyzeIdPatterns() {
    const traitsDir = path.join(process.cwd(), 'traits');
    const svgFiles = getSvgFiles(traitsDir);
    const results = {};
    const categories = {
        'Adobe Artifact': new Set(),
        'Case Mismatch': new Set(),
        'Non-Standard': new Set()
    };
    
    console.log('\nAnalyzing ID patterns in remaining SVG files...\n');
    
    for (const file of svgFiles) {
        const relativePath = path.relative(process.cwd(), file);
        const fileIssues = analyzeFile(file);
        
        if (fileIssues.length > 0) {
            results[relativePath] = fileIssues;
            fileIssues.forEach(({id, category}) => {
                categories[category].add(id);
            });
        }
    }
    
    // Print categorized results
    console.log('Issues by category:\n');
    
    for (const [category, ids] of Object.entries(categories)) {
        if (ids.size > 0) {
            console.log(`\n${category} (${ids.size} unique):`);
            [...ids].sort().forEach(id => console.log(`   - ${id}`));
        }
    }
    
    // Print file-specific results
    console.log('\n\nDetailed file listing:\n');
    for (const [file, issues] of Object.entries(results)) {
        if (issues.length > 0) {
            console.log(`\n📁 ${file}:`);
            issues.forEach(({id, category, issue}) => 
                console.log(`   - ${id} (${category}): ${issue}`));
        }
    }
    
    const totalIssues = Object.values(categories)
        .reduce((sum, set) => sum + set.size, 0);
    console.log(`\nTotal issues found: ${totalIssues}`);
}

analyzeIdPatterns(); 