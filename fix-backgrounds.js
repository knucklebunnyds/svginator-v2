const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const backgroundDir = 'traits/01_background';

function normalizeBackgroundSVG(filePath) {
  console.log(`Processing ${path.basename(filePath)}...`);
  
  // Read the SVG file
  const svgContent = fs.readFileSync(filePath, 'utf8');
  
  // Load with cheerio
  const $ = cheerio.load(svgContent, { xmlMode: true });
  
  // Get the root SVG element
  const svg = $('svg');
  
  // Remove unnecessary namespaces and attributes
  svg.removeAttr('xmlns:xlink');
  svg.attr('xmlns', 'http://www.w3.org/2000/svg');
  svg.attr('version', '1.1');
  
  // Remove style blocks
  $('style').remove();
  
  // Process all paths
  $('path').each((_, elem) => {
    const $path = $(elem);
    
    // Get the fill color from style attribute if it exists
    const style = $path.attr('style');
    if (style) {
      const fillMatch = style.match(/fill:\s*([^;]+)/);
      if (fillMatch) {
        $path.attr('fill', fillMatch[1].trim());
      }
      $path.removeAttr('style');
    }
    
    // Clean up other attributes
    const id = $path.attr('id');
    if (id && !id.startsWith('color-') && !id.startsWith('bg-')) {
      $path.attr('id', `bg-${id}`);
    }
  });
  
  // Generate clean XML
  const output = $.xml();
  
  // Write back to file
  fs.writeFileSync(filePath, output);
  console.log(`Processed ${path.basename(filePath)}`);
}

// Get all SVG files in the background directory
const files = fs.readdirSync(backgroundDir)
  .filter(file => file.endsWith('.svg'))
  .filter(file => !file.endsWith('.backup.svg'));

console.log('Normalizing background SVGs...\n');

files.forEach(file => {
  const filePath = path.join(backgroundDir, file);
  try {
    normalizeBackgroundSVG(filePath);
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
}); 