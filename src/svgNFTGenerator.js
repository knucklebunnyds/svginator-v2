const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const config = require('./config');
const traitCombiner = require('./traitCombiner');
const { generateJSON } = require('./jsonGenerator');
const archiver = require('archiver');

class SVGNFTGenerator {
  constructor(config) {
    this.config = config;
    this.traitsDir = path.join(__dirname, '..', config.traitsFolder);
  }

  // Create zip file
  async createZipFile(sourceDir, zipPath, type = 'collection') {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      output.on('close', () => {
        console.log(`${type} zip created: ${zipPath} (${archive.pointer()} bytes)`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      if (type === 'Collection') {
        // Add SVG documentation
        const docPath = path.join(__dirname, '..', 'output', 'dev', 'svg-structure.md');
        if (fs.existsSync(docPath)) {
          archive.file(docPath, { name: 'SVG-Documentation.md' });
        }
        // Add images in a subdirectory
        archive.directory(sourceDir, 'images');
      } else {
        // For JSON files, just add them directly
        archive.directory(sourceDir, false);
      }

      archive.finalize();
    });
  }

  // Generate style block based on config semantic colors
  generateStyleBlock() {
    return `<?xml-stylesheet type="text/css" href="../styles/semantic.css" ?>`;
  }

  // Create SVG wrapper with proper size and style block
  generateSVGWrapper(content) {
    const { width, height } = this.config.canvasSize;
    return `<?xml version="1.0" encoding="UTF-8"?>
${this.generateStyleBlock()}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${content}
</svg>`;
  }

  // Wrap trait content in category group
  wrapTraitInGroup(content, category, traitFile) {
    const categoryName = category.split('_')[1].toLowerCase();
    const traitName = path.basename(traitFile, '.svg');
    return `<g class="trait-group" data-category="${categoryName}" id="${categoryName}-${traitName}">
      ${content}
    </g>`;
  }

  // Extract SVG content between tags
  extractSVGContent(fileContent) {
    const match = fileContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    return match ? match[1].trim() : '';
  }

  // Generate a single SVG from trait selection
  async generateSingleSVG(traitSelection) {
    let combinedContent = '';

    // Process each selected trait
    Object.entries(traitSelection).forEach(([category, traitFile]) => {
      if (!traitFile) return; // Skip if no trait selected for category

      const traitPath = path.join(this.traitsDir, category, traitFile);
      
      try {
        const traitContent = fs.readFileSync(traitPath, 'utf8');
        const innerContent = this.extractSVGContent(traitContent);
        
        if (innerContent) {
          // Wrap trait content in category group, passing traitFile for ID
          const wrappedContent = this.wrapTraitInGroup(innerContent, category, traitFile);
          combinedContent += wrappedContent;
        }
      } catch (error) {
        console.error(`Error processing trait: ${traitPath}`, error);
      }
    });

    // Generate final SVG with wrapper and styles
    return this.generateSVGWrapper(combinedContent);
  }

  // Generate entire collection
  async generateCollection() {
    const outputDir = path.join(__dirname, '..', this.config.outputFolder);
    const metadataDir = path.join(__dirname, '..', this.config.metadataFolder);
    const imagesDir = path.join(__dirname, '..', this.config.imagesFolder);
    const zipDir = path.join(__dirname, '..', this.config.zipFolder);
    
    // Ensure output directories exist
    await fs.ensureDir(outputDir);
    await fs.ensureDir(metadataDir);
    await fs.ensureDir(imagesDir);
    await fs.ensureDir(zipDir);

    // Remove existing zip files if they exist
    const collectionZipPath = path.join(zipDir, 'KBDS-Collection.zip');
    const jsonZipPath = path.join(zipDir, 'KBDS-json.zip');
    
    try {
      await fs.remove(collectionZipPath);
      await fs.remove(jsonZipPath);
    } catch (error) {
      console.log('No existing zip files to remove');
    }

    console.log(`Generating collection of ${this.config.collectionSize} SVGs...`);
    console.log(`Output directory: ${outputDir}`);
    console.log(`Metadata directory: ${metadataDir}`);
    console.log(`Images directory: ${imagesDir}`);

    for (let i = 0; i < this.config.collectionSize; i++) {
      try {
        // Get unique trait combination from traitCombiner
        const traits = await traitCombiner.generateUniqueCombination();
        console.log(`Generated traits for NFT ${i}:`, traits);
        
        // Generate SVG from traits
        const svg = await this.generateSingleSVG(traits);
        
        // Generate and save metadata
        const tokenId = i;
        console.log(`Generating metadata for token ${tokenId}`);
        const metadata = generateJSON(tokenId, traits);
        console.log(`Generated metadata:`, metadata);
        
        const metadataFilename = `${String(tokenId).padStart(4, '0')}.json`;
        const metadataPath = path.join(metadataDir, metadataFilename);
        console.log(`Writing metadata to: ${metadataPath}`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        
        // Save SVG file
        const svgFilename = `${String(tokenId).padStart(4, '0')}.svg`;
        const svgPath = path.join(imagesDir, svgFilename);
        console.log(`Writing SVG to: ${svgPath}`);
        await fs.writeFile(svgPath, svg);
        
        console.log(`Generated ${svgFilename} and metadata`);
      } catch (error) {
        console.error(`Error generating NFT ${i}:`, error);
      }
    }

    // Generate rarity report after collection is complete
    await traitCombiner.generateRarityReport();

    // Create zip files
    console.log('Creating zip files...');
    try {
      await this.createZipFile(imagesDir, collectionZipPath, 'Collection');
      await this.createZipFile(metadataDir, jsonZipPath, 'JSON');
      console.log('Zip files created successfully');
    } catch (error) {
      console.error('Error creating zip files:', error);
    }
  }
}

module.exports = SVGNFTGenerator; 