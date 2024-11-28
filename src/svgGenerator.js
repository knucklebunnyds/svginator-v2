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

function generateSVG(traits) {
  // Start with base SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
<style>${SEMANTIC_STYLES}</style>`;

  // Process each trait
  for (const [category, trait] of Object.entries(traits)) {
    if (!trait) continue;
    
    const traitPath = path.join(traitsDir, category, trait);
    if (!fs.existsSync(traitPath)) {
      console.error(`Trait file not found: ${traitPath}`);
      continue;
    }
    
    // Create backup
    const backupPath = `${traitPath}.backup`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(traitPath, backupPath);
    }
    
    // Read and process trait
    let content = fs.readFileSync(traitPath, 'utf8');
    content = processTraitSVG(content, category);
    
    // Extract SVG contents (excluding outer svg tag)
    content = content.replace(/<\?xml.*?\?>/, '')
                    .replace(/<svg[^>]*>/, '')
                    .replace(/<\/svg>/, '');
    
    svg += content;
  }
  
  // Close SVG
  svg += '</svg>';
  return svg;
}

module.exports = {
  generateSVG
};
