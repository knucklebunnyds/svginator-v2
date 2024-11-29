const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Default styles for semantic classes
const DEFAULT_STYLES = {
  fill: { fill: '#FFFFFF' },
  outline: { fill: '#000000' },
  shading: { fill: '#AAAAAA', style: 'opacity: 0.5' }
};

function extractStyleColors($) {
  const styleBlocks = $('style');
  const colorMap = new Map();
  
  styleBlocks.each((_, style) => {
    const styleText = $(style).text();
    const colorRules = styleText.match(/\.st\d+\s*{[^}]+}/g) || [];
    colorRules.forEach(rule => {
      const className = rule.match(/\.st(\d+)/)?.[0]?.trim();
      const fill = rule.match(/fill:\s*([^;}\s]+)/)?.[1];
      const opacity = rule.match(/opacity:\s*([^;}\s]+)/)?.[1];
      if (className && (fill || opacity)) {
        colorMap.set(className, { fill, opacity });
      }
    });
  });
  
  return colorMap;
}

function processTraitSVG(filePath) {
  console.log(`Processing trait SVG: ${filePath}`);
  
  const svgContent = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(svgContent, { xmlMode: true });

  // Extract colors from Illustrator style blocks
  const illustratorColors = extractStyleColors($);

  // Process each element
  $('*').each((_, element) => {
    const $el = $(element);
    
    // Keep essential attributes
    const attrsToKeep = ['id', 'class', 'd', 'viewBox', 'xmlns'];
    Object.keys(element.attribs || {}).forEach(attr => {
      if (!attrsToKeep.includes(attr)) {
        $el.removeAttr(attr);
      }
    });

    // Process IDs and apply semantic styles
    const id = $el.attr('id');
    if (id && id.includes('-')) {
      const prefix = id.split('-')[0];
      if (DEFAULT_STYLES[prefix]) {
        $el.attr('class', prefix);
        const defaultStyle = DEFAULT_STYLES[prefix];
        $el.attr('fill', defaultStyle.fill);
        if (defaultStyle.style) {
          $el.attr('style', defaultStyle.style);
        }
      }
    }

    // Process classes
    const classes = $el.attr('class')?.split(' ') || [];
    const semanticClasses = classes.filter(c => ['fill', 'outline', 'shading'].includes(c));
    const illustratorClasses = classes.filter(c => c.startsWith('st'));

    // Apply semantic styles
    if (semanticClasses.length > 0) {
      $el.attr('class', semanticClasses.join(' '));
      semanticClasses.forEach(className => {
        const defaultStyle = DEFAULT_STYLES[className];
        if (defaultStyle) {
          $el.attr('fill', defaultStyle.fill);
          if (defaultStyle.style) {
            $el.attr('style', defaultStyle.style);
          }
        }
      });
    }
    // Convert Illustrator classes to inline styles
    else if (illustratorClasses.length > 0) {
      const illustratorClass = illustratorClasses[0]; // Use first Illustrator class
      const colors = illustratorColors.get(illustratorClass);
      if (colors) {
        if (colors.fill) {
          $el.attr('fill', colors.fill);
        }
        if (colors.opacity) {
          $el.attr('style', `opacity: ${colors.opacity}`);
        }
      }
      // Remove Illustrator class after converting to inline style
      $el.removeAttr('class');
    }
  });

  // Remove style blocks after processing
  $('style').remove();

  // Save the processed SVG
  const processedSvg = $.html();
  fs.writeFileSync(filePath, processedSvg);
  console.log(`Processed and saved trait SVG: ${filePath}`);
}

function processSVG(filePath) {
  processTraitSVG(filePath);
}

// Test function for single file
function testFile(filePath) {
  try {
    processSVG(filePath);
    console.log('Successfully processed file');
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

module.exports = {
  processSVG,
  testFile
}; 