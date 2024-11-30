const { processFile } = require('./add-semantic-classes.js');

// Test a selection of traits from different categories
const testFiles = [
    'traits/03_Mouth/OG.svg',             // Basic mouth trait
    'traits/03_Mouth/scrappy.svg',        // Scrappy mouth trait
    'traits/03_Mouth/jaws.svg',           // Jaws mouth trait
    'traits/03_Mouth/cracked scrappy.svg' // Cracked scrappy mouth trait
];

console.log('Testing selected trait files...\n');

testFiles.forEach(file => {
    console.log(`\nProcessing: ${file}`);
    try {
        processFile(file);
    } catch (error) {
        console.error(`Error processing ${file}:`, error.message);
    }
}); 