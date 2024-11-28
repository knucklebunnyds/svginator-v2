const fs = require('fs');
const path = require('path');

// Import the semantic class processor
const processor = require('./add-semantic-classes.js');

// Test file path
const testFile = 'traits/02_Jaw/OG.svg';

// Create backup
const backupFile = testFile + '.backup';
fs.copyFileSync(testFile, backupFile);

try {
  // Process the file
  processor.processFile(testFile);
  
  // Read the processed content
  const processedContent = fs.readFileSync(testFile, 'utf8');
  
  // Verify changes
  console.log('Verifying changes...');
  
  // Check that style block is removed
  if (processedContent.includes('<style>')) {
    throw new Error('Style block was not removed');
  }
  
  // Check that st classes are replaced
  if (processedContent.includes('class="st')) {
    throw new Error('st classes were not all replaced');
  }
  
  // Check that semantic classes are present
  const semanticClasses = ['fill', 'outline', 'shading'];
  semanticClasses.forEach(className => {
    if (!processedContent.includes(`class="${className}"`)) {
      throw new Error(`Missing semantic class: ${className}`);
    }
  });
  
  console.log('All checks passed! File processed successfully.');
  
} catch (error) {
  // Restore backup on error
  fs.copyFileSync(backupFile, testFile);
  console.error('Error:', error.message);
  console.log('Original file restored from backup');
} finally {
  // Clean up backup
  fs.unlinkSync(backupFile);
} 