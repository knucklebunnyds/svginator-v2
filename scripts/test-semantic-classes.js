const path = require('path');
const { processSingleFile } = require('./add-semantic-classes');

// Process aviators.svg from the Eyes category
const testFile = path.join(__dirname, '..', 'traits', '04_Eyes', 'aviators.svg');

console.log('Testing semantic class conversion on aviators.svg...');
processSingleFile(testFile); 