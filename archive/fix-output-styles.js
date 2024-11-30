const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const outputDir = path.join(__dirname, 'output', 'images');

// Process each SVG file in the output directory
fs.readdirSync(outputDir)
  .filter(file => file.endsWith('.svg'))
  .forEach(file => {
    const filePath = path.join(outputDir, file);
    const svg = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(svg, { xmlMode: true });

    // Update style definitions to use classes only (no default colors)
    const styleTag = $('style');
    styleTag.text(`
  .outline { }
  .fill { }
  .shading { opacity: 0.6; }
`);

    // Only remove style attributes, preserve fill attributes
    $('path').each((_, element) => {
      const el = $(element);
      const classes = el.attr('class');
      
      if (classes) {
        // Remove any style attributes but keep fill attributes
        el.removeAttr('style');
      }
    });

    // Save the modified SVG
    fs.writeFileSync(filePath, $.html());
    console.log(`Fixed styles in ${file}`);
  });

console.log('All files processed.'); 