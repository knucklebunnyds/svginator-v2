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

function updateShadingIds(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(content, { xmlMode: true });
        let changes = [];

        // Find elements that match all criteria
        $('path[id^="outline-shading"]').each((_, element) => {
            const $el = $(element);
            if ($el.attr('class') === 'outline' && 
                $el.attr('data-original-prefix') === 'shading' && 
                $el.attr('opacity')) {
                
                const oldId = $el.attr('id');
                const newId = oldId.replace('outline-shading', 'shading');
                $el.attr('id', newId);
                changes.push({ oldId, newId });
            }
        });

        if (changes.length > 0) {
            // Create backup
            const backupPath = filePath + '.backup';
            if (!fs.existsSync(backupPath)) {
                fs.writeFileSync(backupPath, content);
            }
            
            // Write changes
            fs.writeFileSync(filePath, $.html());
            console.log(`Updated ${changes.length} IDs in: ${path.basename(filePath)}`);
            changes.forEach(({ oldId, newId }) => {
                console.log(`  ${oldId} -> ${newId}`);
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        return false;
    }
}

function main() {
    try {
        const traitsDir = path.join(__dirname, 'traits');
        const svgFiles = getSvgFiles(traitsDir);
        let updatedFiles = 0;
        let totalChanges = 0;

        console.log('Starting ID update process...\n');
        
        svgFiles.forEach(file => {
            if (updateShadingIds(file)) {
                updatedFiles++;
            }
        });

        console.log(`\nProcess complete!`);
        console.log(`Files updated: ${updatedFiles} of ${svgFiles.length}`);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 