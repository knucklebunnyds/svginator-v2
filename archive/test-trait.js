const fs = require('fs');
const { processSVG } = require('./process-traits.js');

console.log('Testing trait processing...');

// Create a test trait SVG
const testTraitSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path id="outline-test" class="outline" d="M10,10 L90,90"/>
  <path id="fill-test" class="fill" d="M20,20 L80,80"/>
  <path id="shading-test" class="shading" d="M30,30 L70,70"/>
</svg>
`;

// Write test trait SVG to a file
fs.writeFileSync('test-trait.svg', testTraitSvg);

// Process the test trait SVG
console.log('\nTesting with simple trait structure:');
processSVG('test-trait.svg');

// Read and display the processed SVG
console.log('\nProcessed test trait:');
console.log(fs.readFileSync('test-trait.svg', 'utf8'));

// Clean up test file
fs.unlinkSync('test-trait.svg');

// Test a real trait file
console.log('\nTesting with actual trait file:');
processSVG('traits/07_Head/rastacap.svg'); 