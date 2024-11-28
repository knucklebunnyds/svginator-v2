const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Default styles for semantic classes
const DEFAULT_STYLES = {
  fill: { fill: '#FFFFFF' },
  outline: { fill: '#000000' },
  shading: { fill: '#AAAAAA', style: 'opacity: 0.5' }
};

function processFile(filePath) {
  console.log(`Processing file: ${filePath}`);
  
  // Read the SVG file
  const svgContent = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(svgContent, { xmlMode: true });

  // Get the root SVG element
  const svgElement = $('svg');

  // Extract colors from style blocks if present
  const styleBlocks = $('style');
  const colorMap = new Map();
  styleBlocks.each((_, style) => {
    const styleText = $(style).text();
    const colorRules = styleText.match(/\.[^{]+{[^}]+}/g) || [];
    colorRules.forEach(rule => {
      const className = rule.match(/\.([^{]+)/)?.[1]?.trim();
      const color = rule.match(/fill:\s*([^;]+)/)?.[1]?.trim();
      if (className && color) {
        colorMap.set(className, color);
      }
    });
  });

  // Process each element
  $('*').each((_, element) => {
    const $el = $(element);
    
    // Keep essential attributes and fill/stroke colors
    const attrsToKeep = ['id', 'class', 'd', 'viewBox', 'xmlns', 'fill', 'stroke', 'style'];
    Object.keys(element.attribs || {}).forEach(attr => {
      if (!attrsToKeep.includes(attr)) {
        $el.removeAttr(attr);
      }
    });

    // Process style attribute to keep only color-related properties
    const style = $el.attr('style');
    if (style) {
      const colorProps = style.split(';')
        .filter(prop => {
          const propName = prop.split(':')[0]?.trim().toLowerCase();
          return propName && (
            propName.includes('fill') || 
            propName.includes('stroke') || 
            propName.includes('color') ||
            propName.includes('opacity')
          );
        })
        .join(';');
      
      if (colorProps) {
        $el.attr('style', colorProps);
      } else {
        $el.removeAttr('style');
      }
    }

    // Process classes - preserve semantic classes
    if ($el.attr('class')) {
      const classes = $el.attr('class').split(' ');
      const validClasses = ['fill', 'shading', 'outline'];
      const filteredClasses = classes.filter(c => validClasses.includes(c));
      
      if (filteredClasses.length > 0) {
        $el.attr('class', filteredClasses.join(' '));

        // Apply default styles based on semantic class if no color is specified
        filteredClasses.forEach(className => {
          const defaultStyle = DEFAULT_STYLES[className];
          if (defaultStyle) {
            // Only apply default fill if no fill color is specified
            if (defaultStyle.fill && !$el.attr('fill') && !style?.includes('fill:')) {
              $el.attr('fill', defaultStyle.fill);
            }
            // Apply opacity for shading if not already present
            if (defaultStyle.style && !style?.includes('opacity:')) {
              $el.attr('style', defaultStyle.style);
            }
          }
        });
      }
    }

    // Process IDs - keep semantic IDs that follow the pattern
    const id = $el.attr('id');
    if (id) {
      // Keep semantic IDs that follow pattern [type]-[part]-[subpart]
      if (id.includes('-')) {
        $el.attr('id', id);

        // Apply default styles based on ID prefix if no class or color is specified
        const prefix = id.split('-')[0];
        if (DEFAULT_STYLES[prefix] && !$el.attr('class')) {
          const defaultStyle = DEFAULT_STYLES[prefix];
          if (defaultStyle.fill && !$el.attr('fill')) {
            $el.attr('fill', defaultStyle.fill);
          }
          if (defaultStyle.style && !$el.attr('style')) {
            $el.attr('style', defaultStyle.style);
          }
          // Add corresponding class based on prefix
          $el.attr('class', prefix);
        }
      }
    }

    // Preserve original colors from style blocks
    const elementClasses = $el.attr('class')?.split(' ') || [];
    elementClasses.forEach(className => {
      const color = colorMap.get(className);
      if (color && !$el.attr('fill')) {
        $el.attr('fill', color);
      }
    });
  });

  // Remove style blocks after processing
  styleBlocks.remove();

  // Save the processed SVG
  const processedSvg = $.html();
  fs.writeFileSync(filePath, processedSvg);
  console.log(`Processed and saved: ${filePath}`);
}

// Test function for single file
function testFile(filePath) {
  try {
    processFile(filePath);
    console.log('Successfully processed file');
  } catch (error) {
    console.error('Error processing file:', error);
  }
}

module.exports = {
  processFile,
  testFile
}; 