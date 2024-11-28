const { processSVGFile } = require('./add-semantic-classes.js');
const path = require('path');

// Test both a simple color background and a complex pattern background
const testFiles = [
  'traits/01_background/blue.svg',
  'traits/01_background/auqua-graffiti.svg'
];

console.log('Testing background SVG processing...\n');

testFiles.forEach(filePath => {
  console.log(`Testing ${filePath}...`);
  const result = processSVGFile(filePath);
  console.log(`Result: ${result ? 'Success' : 'Failed'}\n`);
}); 