const fs = require('fs');
const path = require('path');
const { processSVG } = require('./process-svg.js');

// Test a trait SVG
console.log('Testing trait SVG processing...');

// Create a test SVG with shading
const testSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path id="shading-test" class="shading" d="M10,10 L90,90"/>
</svg>
`;

// Write test SVG to a file
fs.writeFileSync('test.svg', testSvg);

// Process the test SVG
processSVG('test.svg');

// Read and display the processed SVG
console.log('\nProcessed SVG:');
console.log(fs.readFileSync('test.svg', 'utf8'));

// Clean up test file
fs.unlinkSync('test.svg');

// Now test a real trait file
console.log('\nTesting real trait file...');
processSVG('traits/07_Head/rastacap.svg'); 