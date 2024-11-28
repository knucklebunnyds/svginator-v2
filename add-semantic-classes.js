const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('xmldom');

const BACKGROUND_CATEGORY = '01_background';

function processBackgroundSVG(svgContent) {
  // Remove any existing XML declarations
  svgContent = svgContent.replace(/<\?xml[^>]*\?>/g, '');
  
  const parser = new DOMParser();
  const serializer = new XMLSerializer();
  const doc = parser.parseFromString(svgContent, 'text/xml');

  // Remove all style blocks
  const styleElements = doc.getElementsByTagName('style');
  for (let i = styleElements.length - 1; i >= 0; i--) {
    styleElements[i].parentNode.removeChild(styleElements[i]);
  }

  // Process the root SVG element
  const svgElement = doc.documentElement;
  
  // Ensure consistent root attributes
  svgElement.setAttribute('id', 'background');
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('viewBox', '0 0 2048 2048');
  svgElement.setAttribute('class', 'background');

  // Process all paths and groups
  const paths = Array.from(doc.getElementsByTagName('path'));
  const groups = Array.from(doc.getElementsByTagName('g'));
  const elements = [...paths, ...groups];
  
  for (const element of elements) {
    const elementId = element.getAttribute('id') || '';
    let fill = element.getAttribute('fill') || '';
    const styleAttr = element.getAttribute('style') || '';
    
    // Extract fill from style if present
    const styleFill = styleAttr.match(/fill:\s*([^;]+)/)?.[1];
    if (styleFill) {
      fill = styleFill;
    }

    // Determine class based on ID and fill type
    if (elementId.startsWith('color-')) {
      element.setAttribute('class', 'color');
    } else if (elementId.startsWith('bg-')) {
      element.setAttribute('class', 'bg');
    } else if (fill && fill.startsWith('url(#')) {
      element.setAttribute('class', 'gradient');
    }
    
    // Maintain original fill
    if (fill) {
      element.setAttribute('style', `fill: ${fill}`);
      element.setAttribute('fill', fill);
    }
  }

  // Add single XML declaration at the start
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(doc);
}

function processTraitSVG(svgContent) {
  // ... existing trait processing code ...
  return svgContent;
}

function processSVGFile(filePath) {
  console.log(`Processing ${filePath}`);
  const svgContent = fs.readFileSync(filePath, 'utf8');
  
  // Determine if this is a background or trait SVG
  const isBackground = filePath.includes(BACKGROUND_CATEGORY);
  
  try {
    const processedContent = isBackground ? 
      processBackgroundSVG(svgContent) : 
      processTraitSVG(svgContent);
      
    fs.writeFileSync(filePath, processedContent);
    console.log(`Successfully processed ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Test function for processing a single file
function testProcessFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return false;
  }
  return processSVGFile(filePath);
}

module.exports = {
  processSVGFile,
  testProcessFile
}; 