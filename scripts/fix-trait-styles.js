const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

// Create backup of traits directory
function backupTraits() {
  const traitsDir = path.join(__dirname, '..', 'traits');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', `traits_backup_${timestamp}`);
  
  console.log(`Creating backup in: ${backupDir}`);
  fs.mkdirSync(backupDir, { recursive: true });
  
  function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      const files = fs.readdirSync(src);
      for (const file of files) {
        copyRecursive(path.join(src, file), path.join(dest, file));
      }
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  
  copyRecursive(traitsDir, backupDir);
  console.log('Backup complete\n');
}

// Utility function to walk directory recursively
function* walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const pathToFile = path.join(dir, file);
    const stat = fs.statSync(pathToFile);
    if (stat.isDirectory()) {
      yield* walkSync(pathToFile);
    } else if (file.endsWith('.svg') && !file.endsWith('.backup')) {
      yield pathToFile;
    }
  }
}

// Process a single SVG file
function processSVG(filePath) {
  console.log(`Processing ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');

  // Remove style blocks
  const styles = doc.getElementsByTagName('style');
  while (styles.length > 0) {
    styles[0].parentNode.removeChild(styles[0]);
  }

  // Remove Adobe Illustrator classes
  const elements = doc.getElementsByTagName('*');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    if (element.hasAttribute('class')) {
      const classes = element.getAttribute('class');
      if (classes.includes('st')) {
        element.removeAttribute('class');
      }
    }
  }

  // Process elements based on ID patterns
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const id = element.getAttribute('id') || '';
    
    // Handle shading elements
    if (id.includes('shading-') || id.includes('-shading-')) {
      element.setAttribute('fill', '#aaaaaa');
      element.setAttribute('opacity', '0.5');
      
      // Fix incorrect ID format
      if (id.startsWith('outline-shading-')) {
        element.setAttribute('id', id.replace('outline-shading-', 'shading-'));
      }
      continue;
    }
    
    // Handle outline elements
    if (id.startsWith('outline-')) {
      element.setAttribute('fill', '#000000');
      continue;
    }
    
    // Handle fill elements
    if (id.startsWith('fill-')) {
      element.setAttribute('fill', '#ffffff');
      continue;
    }
    
    // For background elements, preserve their original fills
    if (filePath.includes('01_background')) {
      const originalFill = element.getAttribute('fill') || 
                         element.getAttribute('style')?.match(/fill:\s*([^;]+)/)?.[1];
      if (originalFill) {
        element.setAttribute('fill', originalFill);
      }
    }
  }

  // Serialize back to string
  const serializer = new XMLSerializer();
  const output = serializer.serializeToString(doc);

  // Write changes
  fs.writeFileSync(filePath, output, 'utf8');
}

// Main function
async function main() {
  try {
    // Create backup first
    backupTraits();
    
    const traitsDir = path.join(__dirname, '..', 'traits');
    console.log('Processing SVG files...\n');
    
    // Process all SVG files
    for (const file of walkSync(traitsDir)) {
      processSVG(file);
    }
    
    console.log('\nAll files processed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 