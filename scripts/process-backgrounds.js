const fs = require('fs');
const path = require('path');
const { processSVGFile } = require('./add-semantic-classes.js');

const backgroundDir = 'traits/01_background';

// Get all SVG files in the background directory
const files = fs.readdirSync(backgroundDir)
  .filter(file => file.endsWith('.svg'))
  .filter(file => !file.endsWith('.backup.svg'));

console.log('Processing all background SVGs...\n');

files.forEach(file => {
  const filePath = path.join(backgroundDir, file);
  console.log(`Processing ${file}...`);
  const result = processSVGFile(filePath);
  console.log(`Result: ${result ? 'Success' : 'Failed'}\n`);
}); 