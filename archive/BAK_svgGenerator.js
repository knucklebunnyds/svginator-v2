const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const cheerio = require('cheerio');

const traitsDir = path.join(__dirname, '..', config.traitsFolder);
const { semanticColors } = config;

// Global style block for semantic classes
const SEMANTIC_STYLES = `
  .outline { fill: #000000; }
  .fill { fill: #ffffff; }
  .shading { fill: #aaaaaa; opacity: 0.5; }
`;

function processTraitSVG(content, category) {
  const $ = cheerio.load(content, { xmlMode: true });
  
  // Remove style blocks but preserve their color information
  const styleColors = new Map();
  $('style').each((_, style) => {
    const styleText = $(style).text();
    styleText.replace(/\.st(\d+)\s*{([^}]+)}/g, (_, className, style) => {
      styleColors.set(`.st${className}`, style.trim());
    });
    $(style).remove();
  });
  
  // Special handling for backgrounds
  if (category.startsWith('01_background')) {
    // Process paths and preserve original colors
    $('path').each((_, elem) => {
      const $path = $(elem);
      const classes = ($path.attr('class') || '').split(' ');
      const id = $path.attr('id') || '';
      
      // Add specific background classes based on ID prefixes
      if (id.startsWith('color-')) {
        $path.addClass('color');
      } else if (id.startsWith('gradient-')) {
        $path.addClass('gradient');
      } else if (id.startsWith('bg-')) {
        $path.addClass('bg');
      }
      
      // Convert st classes to inline styles
      classes.forEach(className => {
        if (className.startsWith('st') && styleColors.has(`.${className}`)) {
          const style = styleColors.get(`.${className}`);
          $path.attr('style', style);
          $path.removeClass(className);
        }
      });
    });
    
    // Wrap all content in a background group
    const $svg = $('svg');
    const $contents = $svg.contents();
    const $group = $('<g class="background"></g>');
    $contents.wrap($group);
  } else {
    // Regular trait processing for non-background traits
    $('path').each((_, elem) => {
      const $path = $(elem);
      const classes = ($path.attr('class') || '').split(' ');
      const id = $path.attr('id') || '';
      
      // Handle semantic classes based on ID prefixes
      if (id.startsWith('outline-')) {
        $path.addClass('outline');
      } else if (id.startsWith('fill-')) {
        $path.addClass('fill');
      } else if (id.startsWith('shading-')) {
        $path.addClass('shading');
      }
      
      // Convert st classes to inline styles
      classes.forEach(className => {
        if (className.startsWith('st') && styleColors.has(`.${className}`)) {
          const style = styleColors.get(`.${className}`);
          $path.attr('style', style);
          $path.removeClass(className);
        }
      });
    });
    
    // Wrap non-background traits in category group
    const categoryName = category.split('_')[1].toLowerCase();
    const $svg = $('svg');
    const $contents = $svg.contents();
    const $group = $(`<g class="trait-group" data-category="${categoryName}"></g>`);
    $contents.wrap($group);
  }
  
  return $.xml();
}

function wrapTraitInGroup(trait, category) {
  // Add category ID and data attribute to group
  return `<g class="trait-group" id="${category.toLowerCase()}-trait" data-category="${category}">
${trait}
</g>`;
}

function processShading(svg) {
  // Update shading elements to use consistent colors and opacity
  const shadingRegex = /class="shading"/g;
  const outlineShadingRegex = /id="outline-shading-[^"]+"/g;
  
  // Replace any outline-shading IDs with just shading
  svg = svg.replace(outlineShadingRegex, (match) => {
    return match.replace('outline-shading-', 'shading-');
  });
  
  // Ensure shading elements have correct fill and opacity
  svg = svg.replace(shadingRegex, 'class="shading" fill="#9933FF" opacity="0.6"');
  
  return svg;
}

function generateSVG(traits, config) {
  const svgStart = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${config.canvasSize.width} ${config.canvasSize.height}">
${generateSVGStyle(config)}
`;

  const svgEnd = '</svg>';
  let svgContent = '';

  // Process each trait category in order
  Object.entries(traits).forEach(([category, trait]) => {
    const traitPath = path.join(config.traitsFolder, category, trait);
    const traitContent = fs.readFileSync(traitPath, 'utf8');
    
    // Extract the SVG content between the first <svg> and </svg> tags
    const match = traitContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (match) {
      const innerContent = match[1];
      // Wrap the content in a group with the category as a data attribute
      svgContent += `<g class="trait-group" data-category="${category.replace(/^\d+_/, '')}">${innerContent}</g>`;
    }
  });

  return svgStart + svgContent + svgEnd;
}

function generateSVGStyle(config) {
  return `<style>
  .outline { fill: ${config.semanticColors.outline}; }
  .fill { fill: ${config.semanticColors.fill}; }
  .shading { fill: ${config.semanticColors.shading.color}; opacity: ${config.semanticColors.shading.opacity}; }
</style>`;
}

module.exports = {
  generateSVG
};
