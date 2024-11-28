const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const { generateUniqueCombination, generateRarityReport } = require('./traitCombiner');
const { generateSVG } = require('./svgGenerator');
const { generateJSON } = require('./jsonGenerator');

const outputDir = path.join(__dirname, '..', config.outputFolder);
const imagesDir = path.join(outputDir, 'images');
const metadataDir = path.join(outputDir, 'metadata');

async function cleanOutputFolders() {
  await fs.emptyDir(imagesDir);
  await fs.emptyDir(metadataDir);
  
  // Create styles directory and add collection.css
  const stylesDir = path.join(outputDir, 'styles');
  await fs.ensureDir(stylesDir);
  
  const cssContent = `/* KBDS Collection Styles */

/* Basic semantic class styles */
.outline { 
    fill: ${config.semanticColors.outline}; 
}

.fill { 
    fill: ${config.semanticColors.fill}; 
}

.shading { 
    fill: ${config.semanticColors.shading.color}; 
    opacity: ${config.semanticColors.shading.opacity}; 
}

/* Simple animation */
path { 
    transition: all 0.3s ease; 
}`;

  await fs.writeFile(path.join(stylesDir, 'collection.css'), cssContent);
  console.log("Output folders and styles created.");
}

async function generateNFTCollection() {
  await fs.ensureDir(imagesDir);
  await fs.ensureDir(metadataDir);

  const existingCombinations = new Set();

  for (let i = 0; i < config.collectionSize; i++) {
    const traits = await generateUniqueCombination(existingCombinations);
    const svgContent = await generateSVG(traits);
    const jsonContent = generateJSON(i, traits);

    const paddedIndex = String(i).padStart(4, '0');
    await fs.writeFile(path.join(imagesDir, `${paddedIndex}.svg`), svgContent);
    await fs.writeFile(path.join(metadataDir, `${paddedIndex}.json`), JSON.stringify(jsonContent, null, 2));

    console.log(`Generated NFT #${paddedIndex}`);
    
    // Generate interim reports every 10 NFTs
    if ((i + 1) % 10 === 0) {
      console.log('\nGenerating interim rarity report...');
      await generateRarityReport();
    }
  }

  // Final rarity report
  console.log('\nGenerating final rarity report...');
  await generateRarityReport();
}

async function main() {
  try {
    await cleanOutputFolders();
    await generateNFTCollection();
    console.log("NFT collection generated successfully!");
    
    // Ensure final rarity report is generated
    console.log('\nGenerating final rarity report...');
    await generateRarityReport();
  } catch (error) {
    console.error("Generation failed:", error);
    
    // Try to generate rarity report even if generation fails
    console.log('\nAttempting to generate rarity report after error...');
    await generateRarityReport();
    
    process.exit(1);
  }
}

main().catch(console.error);
