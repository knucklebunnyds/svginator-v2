const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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

function verifyShadingElements(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content, { xmlMode: true });
        let issues = [];

        // Find all elements with outline-shading in their ID
        $('path[id^="outline-shading"]').each((_, element) => {
            const $el = $(element);
            const id = $el.attr('id');
            const className = $el.attr('class');
            const prefix = $el.attr('data-original-prefix');
            const opacity = $el.attr('opacity');

            // Check for any missing or inconsistent attributes
            if (!className) {
                issues.push({ id, issue: 'Missing class attribute' });
            } else if (className !== 'outline') {
                issues.push({ id, issue: `Unexpected class: "${className}"` });
            }

            if (!prefix) {
                issues.push({ id, issue: 'Missing data-original-prefix' });
            } else if (prefix !== 'shading') {
                issues.push({ id, issue: `Unexpected prefix: "${prefix}"` });
            }

            if (!opacity) {
                issues.push({ id, issue: 'Missing opacity attribute' });
            }
        });

        if (issues.length > 0) {
            console.log(`\nIssues in ${path.basename(filePath)}:`);
            issues.forEach(({ id, issue }) => {
                console.log(`  ${id}: ${issue}`);
            });
            return issues;
        }
        return [];
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return [];
    }
}

function main() {
    try {
        const traitsDir = path.join(__dirname, 'traits');
        const svgFiles = getSvgFiles(traitsDir);
        let filesWithIssues = 0;
        let totalIssues = 0;

        console.log('Starting verification process...\n');
        
        svgFiles.forEach(file => {
            const issues = verifyShadingElements(file);
            if (issues.length > 0) {
                filesWithIssues++;
                totalIssues += issues.length;
            }
        });

        console.log(`\nVerification complete!`);
        console.log(`Files with issues: ${filesWithIssues} of ${svgFiles.length}`);
        console.log(`Total issues found: ${totalIssues}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 