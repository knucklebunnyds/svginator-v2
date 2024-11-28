const fs = require('fs');
const path = require('path');

// List of valid semantic classes for non-background traits
const SEMANTIC_CLASSES = ['fill', 'shading', 'outline'];

// Helper color checking functions
function isWhiteColor(color) {
	color = color.toLowerCase().trim();
	return (
		color === '#fff' ||
		color === '#ffffff' ||
		color === 'white' ||
		color === 'rgb(255,255,255)' ||
		color === 'rgb(255, 255, 255)'
	);
}

function isGrayColor(color) {
	color = color.toLowerCase().trim();
	return (
		color === '#aaa' ||
		color === '#aaaaaa' ||
		color === 'gray' ||
		color === 'grey' ||
		color === 'rgb(170,170,170)' ||
		color === 'rgb(170, 170, 170)'
	);
}

function isBlackColor(color) {
	color = color.toLowerCase().trim();
	return (
		color === '#000' ||
		color === '#000000' ||
		color === 'black' ||
		color === 'rgb(0,0,0)' ||
		color === 'rgb(0, 0, 0)'
	);
}

function getSemanticClassFromStyle(styleBlock, stClass) {
	const regex = new RegExp(`\\.${stClass}\\s*{([^}]+)}`, 'i');
	const match = styleBlock.match(regex);
	if (!match) return null;

	const properties = match[1].toLowerCase();
	const fillMatch = properties.match(/fill:\s*([^;]+)/);
	const fillColor = fillMatch ? fillMatch[1].trim() : '';

	if (properties.includes('opacity') || properties.includes('isolation: isolate')) {
		return 'shading';
	}
	
	if (fillColor) {
		if (isWhiteColor(fillColor)) {
			return 'fill';
		}
		if (isBlackColor(fillColor)) {
			return 'outline';
		}
		if (isGrayColor(fillColor)) {
			return properties.includes('opacity') ? 'shading' : 'outline';
		}
	}

	return 'outline';
}

function isBackgroundCategory(filePath) {
	return filePath.includes('/01_background/') || 
		   filePath.includes('\\01_background\\');
}

function processBackgroundFile(filePath, content) {
	// For background files, we only:
	// 1. Preserve existing styles and classes
	// 2. Keep color- and gradient- prefixed IDs
	// 3. Don't add any semantic classes

	// Process each path element
	content = content.replace(/<path([^>]*?)(\/?>|><\/path>)/g, (match, attributes, endTag) => {
		// Keep all existing attributes except data- attributes
		let updatedAttributes = attributes
			.replace(/\s+data-[^=]*="[^"]*"/g, '');
		
		// Preserve the original closing tag style
		const isSelfClosing = endTag === '/>' || endTag === ' />';
		return `<path${updatedAttributes}${isSelfClosing ? '/>' : '></path>'}`;
	});

	return content;
}

function processSingleFile(filePath) {
	console.log(`Processing file: ${filePath}`);
	
	// Read the SVG file
	let content = fs.readFileSync(filePath, 'utf8');
	
	// Handle background files differently
	if (isBackgroundCategory(filePath)) {
		content = processBackgroundFile(filePath, content);
		fs.writeFileSync(filePath, content, 'utf8');
		console.log(`Updated background file: ${filePath}`);
		return;
	}
	
	// Extract style block if it exists
	const styleMatch = content.match(/<style>[^]*?<\/style>/);
	const styleBlock = styleMatch ? styleMatch[0] : '';
	
	// Create a map of st classes to semantic classes
	const stClassMap = {};
	if (styleBlock) {
		const stClassRegex = /\.st(\d+)\s*{/g;
		let match;
		while ((match = stClassRegex.exec(styleBlock)) !== null) {
			const stClass = `st${match[1]}`;
			stClassMap[stClass] = getSemanticClassFromStyle(styleBlock, stClass);
		}
	}
	
	// Remove any existing style blocks and comments
	content = content.replace(/<!--[\s\S]*?-->/g, '');
	content = content.replace(/<style>[\s\S]*?<\/style>/g, '');
	
	// Add XML stylesheet reference after the XML declaration
	const styleReference = `<?xml-stylesheet type="text/css" href="../styles/collection.css"?>`;
	content = content.replace(/<\?xml[^>]*\?>/, `$&\n${styleReference}`);
	
	// Add semantic documentation comment
	const documentation = `
  <!-- Semantic Classes:
    - fill: Areas that can be colored by the user
    - shading: Areas that provide depth/shading
    - outline: Lines that define the shape
  -->`;
	
	// Add the documentation after the svg tag
	content = content.replace(/<svg([^>]*)>/, `<svg$1>${documentation}`);
	
	// Process each path element
	content = content.replace(/<path([^>]*?)(\/?>|><\/path>)/g, (match, attributes, endTag) => {
		// Extract existing class and id
		const classMatch = attributes.match(/class="([^"]*)"/);
		const idMatch = attributes.match(/id="([^"]*)"/);
		
		// Initialize semantic classes array
		let semanticClasses = [];
		
		// Add class based on id if it exists - this takes precedence
		if (idMatch) {
			const idParts = idMatch[1].split('-');
			if (idParts.length > 1) {
				const prefix = idParts[0];
				if (SEMANTIC_CLASSES.includes(prefix)) {
					semanticClasses = [prefix];
				}
			}
		}
		
		// Add class based on st mapping if no ID prefix exists
		if (!semanticClasses.length && classMatch) {
			const existingClasses = classMatch[1].split(' ');
			existingClasses.forEach(cls => {
				if (cls.startsWith('st') && stClassMap[cls]) {
					const semanticClass = stClassMap[cls];
					if (!semanticClasses.includes(semanticClass)) {
						semanticClasses.push(semanticClass);
					}
				}
			});
		}
		
		// Create the updated attributes
		let updatedAttributes = attributes
			.replace(/\s+class="[^"]*"/g, '')
			.replace(/\s+style="[^"]*"/g, '')
			.replace(/\s+data-[^=]*="[^"]*"/g, '');
		
		// Add the classes
		if (semanticClasses.length > 0) {
			updatedAttributes += ` class="${semanticClasses.join(' ')}"`;
		}
		
		// Preserve the original closing tag style
		const isSelfClosing = endTag === '/>' || endTag === ' />';
		return `<path${updatedAttributes}${isSelfClosing ? '/>' : '></path>'}`;
	});
	
	// Write the modified content back to the file
	fs.writeFileSync(filePath, content, 'utf8');
	console.log(`Updated ${filePath}`);
}

// Create the external CSS file
function createExternalCSS(outputDir) {
	const cssContent = `/* KBDS Collection Styles */

/* Default styles for semantic classes */
.fill {
    fill: #FFFFFF;
}

.shading {
    fill: #AAAAAA;
    opacity: 0.5;
}

.outline {
    fill: #000000;
}

/* Interactive states */
.fill:hover {
    cursor: pointer;
}

/* You can add collection-wide color themes here */
.theme-dark .fill {
    fill: #333333;
}

.theme-dark .shading {
    fill: #666666;
    opacity: 0.7;
}

.theme-dark .outline {
    fill: #FFFFFF;
}`;

	const stylesDir = path.join(outputDir, 'styles');
	if (!fs.existsSync(stylesDir)) {
		fs.mkdirSync(stylesDir, { recursive: true });
	}
	
	const cssPath = path.join(stylesDir, 'collection.css');
	fs.writeFileSync(cssPath, cssContent, 'utf8');
	console.log(`Created external CSS file at: ${cssPath}`);
}

function processDirectory(directory) {
	if (!fs.existsSync(directory)) {
		console.error(`Directory not found: ${directory}`);
		return;
	}
	
	// Create the external CSS file first
	createExternalCSS(path.resolve(directory, '..'));
	
	const files = fs.readdirSync(directory);
	
	files.forEach(file => {
		const filePath = path.join(directory, file);
		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			// Recursively process subdirectories
			processDirectory(filePath);
		} else if (file.endsWith('.svg')) {
			processSingleFile(filePath);
		}
	});
}

module.exports = {
	processSingleFile,
	processDirectory,
	createExternalCSS
}; 