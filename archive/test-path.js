const fs = require('fs');
const cheerio = require('cheerio');

// Test SVG content with a single path
const testSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
  <path id="shading-test" class="shading" d="M100,100 L200,200" fill="#aaaaaa" style="opacity: 0.5"/>
</svg>
`;

// Load and process the SVG
const $ = cheerio.load(testSvg, { xmlMode: true });

// Get the path element
const path = $('path');
console.log('\nOriginal path attributes:');
console.log(path.attr());

// Process the path
const DEFAULT_STYLES = {
  fill: { fill: '#FFFFFF' },
  outline: { fill: '#000000' },
  shading: { fill: '#AAAAAA', style: 'opacity: 0.5' }
};

// Get the class and apply default style
const className = path.attr('class');
if (className && DEFAULT_STYLES[className]) {
  const defaultStyle = DEFAULT_STYLES[className];
  path.attr('fill', defaultStyle.fill);
  if (defaultStyle.style) {
    path.attr('style', defaultStyle.style);
  }
}

console.log('\nProcessed path attributes:');
console.log(path.attr());

// Output the processed SVG
console.log('\nProcessed SVG:');
console.log($.html()); 