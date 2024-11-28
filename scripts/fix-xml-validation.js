const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

function fixXMLValidation(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    // Function to process all elements recursively
    function processElement(element) {
        if (element.attributes) {
            // Convert attributes to array for iteration
            const attributes = Array.from(element.attributes);
            
            // Check each attribute
            attributes.forEach(attr => {
                if (attr.name.startsWith('data-original-') && !attr.value) {
                    // Remove empty data-original- attributes
                    element.removeAttribute(attr.name);
                }
            });
        }
        
        // Process child elements
        const children = Array.from(element.childNodes);
        children.forEach(child => {
            if (child.nodeType === 1) { // ELEMENT_NODE
                processElement(child);
            }
        });
    }
    
    processElement(doc.documentElement);
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    let fixedContent = serializer.serializeToString(doc);
    
    // Add XML declaration if it doesn't exist
    if (!fixedContent.startsWith('<?xml')) {
        fixedContent = '<?xml version="1.0" encoding="UTF-8"?>\n' + fixedContent;
    }
    
    // Write back to file
    fs.writeFileSync(filePath, fixedContent, 'utf8');
}

// Process all SVG files in the traits directory recursively
function processDirectory(directory) {
    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (path.extname(fullPath) === '.svg') {
            console.log(`Processing: ${fullPath}`);
            try {
                fixXMLValidation(fullPath);
                console.log(`✓ Fixed: ${fullPath}`);
            } catch (error) {
                console.error(`Error processing ${fullPath}:`, error);
            }
        }
    });
}

// Start processing from the traits directory
processDirectory('traits'); 