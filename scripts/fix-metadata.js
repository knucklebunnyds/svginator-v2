const fs = require('fs');
const path = require('path');

// Function to pad number with zeros
function padNumber(num) {
    return String(num).padStart(4, '0');
}

// Function to update metadata files
async function updateMetadataFiles() {
    const metadataDir = path.join(process.cwd(), 'output', 'metadata');
    const imagesDir = path.join(process.cwd(), 'output', 'images');

    // Get list of SVG files
    const svgFiles = fs.readdirSync(imagesDir)
        .filter(file => file.endsWith('.svg'))
        .sort();

    // Get list of metadata files
    const metadataFiles = fs.readdirSync(metadataDir)
        .filter(file => file.endsWith('.json'))
        .sort();

    console.log(`Found ${svgFiles.length} SVG files and ${metadataFiles.length} metadata files`);

    // Create backup directory
    const backupDir = path.join(metadataDir, 'backup');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    // Backup existing metadata files
    metadataFiles.forEach(file => {
        const sourcePath = path.join(metadataDir, file);
        const backupPath = path.join(backupDir, file);
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`Backed up ${file}`);
    });

    // Update metadata files
    metadataFiles.forEach((file, index) => {
        const oldPath = path.join(metadataDir, file);
        const svgNumber = parseInt(svgFiles[index].split('.')[0]);
        const newNumber = padNumber(svgNumber);
        const newPath = path.join(metadataDir, `${newNumber}.json`);

        try {
            // Read and update metadata
            const metadata = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
            metadata.name = `KBDS Doge Knuckleheads #${newNumber}`;
            metadata.image = `${newNumber}.svg`;
            metadata.properties.files[0].uri = `${newNumber}.svg`;

            // Write updated metadata
            fs.writeFileSync(newPath, JSON.stringify(metadata, null, 2));

            // Delete old file if it's different from the new path
            if (oldPath !== newPath) {
                fs.unlinkSync(oldPath);
            }

            console.log(`Updated metadata file: ${file} -> ${newNumber}.json`);
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    });

    console.log('Metadata files updated successfully!');
    console.log('Backup files stored in output/metadata/backup/');
}

updateMetadataFiles().catch(error => {
    console.error('Error:', error);
}); 