const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

// Create backup of specific files
function backupFiles(files) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', `traits_backup_${timestamp}`);
  
  console.log(`Creating backup in: ${backupDir}`);
  fs.mkdirSync(backupDir, { recursive: true });
  
  files.forEach(filePath => {
    const relativePath = path.relative(path.join(__dirname, '..', 'traits'), filePath);
    const backupPath = path.join(backupDir, relativePath);
    
    // Create directory structure if needed
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    
    // Copy file
    fs.copyFileSync(filePath, backupPath);
  });
  
  console.log('Backup complete\n');
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
    // Get file paths from command line arguments
    const filePaths = process.argv.slice(2);
    
    if (filePaths.length === 0) {
      console.log('Please provide one or more SVG file paths as arguments');
      console.log('Example: node fix-trait-styles.js traits/01_background/file1.svg traits/02_Jaw/file2.svg');
      process.exit(1);
    }

    // Validate files exist and are SVGs
    filePaths.forEach(filePath => {
      const fullPath = path.resolve(__dirname, '..', filePath);
      if (!fs.existsSync(fullPath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
      }
      if (!filePath.endsWith('.svg')) {
        console.error(`File is not an SVG: ${filePath}`);
        process.exit(1);
      }
    });

    // Create backup of specified files
    backupFiles(filePaths.map(p => path.resolve(__dirname, '..', p)));
    
    console.log('Processing SVG files...\n');
    
    // Process specified files
    filePaths.forEach(filePath => {
      const fullPath = path.resolve(__dirname, '..', filePath);
      processSVG(fullPath);
    });
    
    console.log('\nAll files processed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 