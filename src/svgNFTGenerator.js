const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const config = require('./config');
const traitCombiner = require('./traitCombiner');

class SVGNFTGenerator {
  constructor(config) {
    this.config = config;
    this.traitsDir = path.join(__dirname, '..', config.traitsFolder);
  }

  // Generate style block based on config semantic colors
  generateStyleBlock() {
    const { semanticColors } = this.config;
    return `<style>
      .outline { fill: ${semanticColors.outline}; }
      .fill { fill: ${semanticColors.fill}; }
      .shading { fill: ${semanticColors.shading.color}; opacity: ${semanticColors.shading.opacity}; }
    </style>`;
  }

  // Create SVG wrapper with proper size and style block
  generateSVGWrapper(content) {
    const { width, height } = this.config.canvasSize;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  ${this.generateStyleBlock()}
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
    await fs.ensureDir(outputDir);

    console.log(`Generating collection of ${this.config.collectionSize} SVGs...`);

    for (let i = 0; i < this.config.collectionSize; i++) {
      try {
        // Get unique trait combination from traitCombiner
        const traits = await traitCombiner.generateUniqueCombination();
        
        // Generate SVG from traits
        const svg = await this.generateSingleSVG(traits);
        
        // Save SVG file
        const filename = `${String(i + 1).padStart(4, '0')}.svg`;
        await fs.writeFile(path.join(outputDir, filename), svg);
        
        console.log(`Generated ${filename}`);
      } catch (error) {
        console.error(`Error generating SVG ${i + 1}:`, error);
      }
    }

    // Generate rarity report after collection is complete
    await traitCombiner.generateRarityReport();
  }
}

module.exports = SVGNFTGenerator; 