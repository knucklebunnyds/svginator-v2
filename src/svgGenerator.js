const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

const traitsDir = path.join(__dirname, '..', config.traitsFolder);
const { semanticColors } = config;

function removeAllStyleBlocks(content) {
  // Remove style blocks within groups
  content = content.replace(/<g[^>]*>[\s\S]*?<style[\s\S]*?<\/style>/g, (match) => {
    return match.replace(/<style[\s\S]*?<\/style>/g, '');
  });
  
  // Remove any remaining style blocks
  content = content.replace(/<style[\s\S]*?<\/style>/g, '');
  
  return content;
}

function processSemanticClasses(content) {
  console.log('\nProcessing semantic classes...');
  
  // First pass: extract colors from style blocks
  const styleColors = new Map();
  content = content.replace(/<style>([\s\S]*?)<\/style>/g, (match, styles) => {
    // Extract colors from style rules
    styles.replace(/\.([^\s{]+)\s*{([^}]+)}/g, (_, className, style) => {
      if (!className.startsWith('st')) { // Ignore Illustrator classes
        styleColors.set(className.trim(), style.trim());
      }
    });
    return ''; // Remove style block
  });
  
  // Second pass: collect all elements and their attributes
  const elements = new Map();
  const elementRegex = /id="([^"]+)"([^>]*?)(?:class="([^"]*)")?(?:style="([^"]*)")?/g;
  let match;
  
  while ((match = elementRegex.exec(content)) !== null) {
    const [_, id, attrs, classes, style] = match;
    console.log(`Found element with id: ${id}`);
    
    // Initialize element data
    const elementData = {
      classes: new Set(),
      style: style || ''
    };
    
    // Process existing classes
    if (classes) {
      classes.split(/\s+/).filter(c => c).forEach(c => {
        // Only keep semantic classes and their colors
        if (!c.startsWith('st')) {
          elementData.classes.add(c);
          if (styleColors.has(c)) {
            elementData.style = styleColors.get(c);
          }
        }
      });
    }
    
    elements.set(id, elementData);
  }
  
  // Third pass: add semantic classes based on ID prefixes
  elements.forEach((data, id) => {
    if (id.startsWith('outline-')) {
      data.classes.add('outline');
      console.log(`Added 'outline' class to ${id}`);
    }
    if (id.startsWith('fill-')) {
      data.classes.add('fill');
      console.log(`Added 'fill' class to ${id}`);
    }
    if (id.startsWith('shading-')) {
      data.classes.add('shading');
      console.log(`Added 'shading' class to ${id}`);
    }
  });
  
  // Final pass: apply updated classes and styles
  elements.forEach((data, id) => {
    const classStr = Array.from(data.classes).join(' ');
    const styleStr = data.style ? ` style="${data.style}"` : '';
    
    // Create a regex that matches the entire element opening tag
    const elementRegex = new RegExp(`(<[^>]*?id="${id}"[^>]*?)>`, 'g');
    content = content.replace(elementRegex, (match, prefix) => {
      // Remove any existing class and style attributes
      const cleanPrefix = prefix
        .replace(/\s*class="[^"]*"/g, '')
        .replace(/\s*style="[^"]*"/g, '');
      
      const result = `${cleanPrefix}${classStr ? ` class="${classStr}"` : ''}${styleStr}>`;
      console.log(`Updated element ${id}:\n  ${result}`);
      return result;
    });
  });
  
  return content;
}

async function readSVGFile(filePath) {
  if (!await fs.pathExists(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  let content = await fs.readFile(filePath, 'utf8');
  
  console.log(`Reading SVG file: ${filePath}`);
  
  try {
    // Remove XML declaration, comments, and metadata
    content = content.replace(/<\?xml.*?\?>/g, '');
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    content = content.replace(/<metadata>[\s\S]*?<\/metadata>/g, '');
    
    // Process semantic classes and remove style blocks
    content = processSemanticClasses(content);
    content = removeAllStyleBlocks(content);
    
    // More robust SVG content extraction
    const startTag = content.indexOf('<svg');
    const endTag = content.lastIndexOf('</svg>') + 6;
    
    if (startTag === -1 || endTag === -1) {
      console.error('SVG content:', content);
      throw new Error(`Missing SVG tags in file: ${filePath}`);
    }

    let svgContent = content.slice(startTag, endTag);
    const openTagEnd = svgContent.indexOf('>') + 1;
    const closeTagStart = svgContent.lastIndexOf('</svg>');
    
    if (openTagEnd === 0 || closeTagStart === -1) {
      throw new Error(`Malformed SVG tags in file: ${filePath}`);
    }

    const innerContent = svgContent.slice(openTagEnd, closeTagStart);
    return innerContent.trim();

  } catch (error) {
    console.error('Error processing SVG file:', filePath);
    console.error('Original content:', content);
    console.error('Error details:', error);
    throw error;
  }
}

async function generateSVG(traits) {
  console.log('\n🎨 Generating SVG with traits:', traits);
  
  const categories = config.traitOrder;
  
  // Start with XML declaration and stylesheet reference
  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="styles/collection.css"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">`;
  
  for (const category of categories) {
    if (traits[category]) {
      const traitName = traits[category].endsWith('.svg') 
        ? traits[category] 
        : `${traits[category]}.svg`;
      const traitFile = path.join(traitsDir, category, traitName);
      
      console.log(`\n🔍 Processing trait: ${category}/${traitName}`);
      
      let traitContent = await readSVGFile(traitFile);
      svgContent += `<g id="${category}" data-trait="${traitName.replace('.svg', '')}">${traitContent}</g>`;
      
      console.log(`✅ Added trait to SVG with ID: ${category}`);
    }
  }

  svgContent += '</svg>';
  return svgContent;
}

module.exports = { generateSVG };
