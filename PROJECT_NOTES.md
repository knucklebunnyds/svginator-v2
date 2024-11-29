# SVGinator v2 Project Notes

## Project Overview
SVGinator v2 is an NFT generation system that combines SVG trait layers to create unique NFTs with interactive coloring capabilities.

## Project Organization

### 1. Core Generation (/src)
- `index.js`: Main entry point
- `config.js`: Project configuration
- `svgNFTGenerator.js`: NFT generation engine
- `traitCombiner.js`: Trait combination and rarity
- `jsonGenerator.js`: Metadata generation

### 2. Processing Scripts (/scripts)
- `process-traits.js`: Main trait processing
- `process-backgrounds.js`: Background processing
- `test-backgrounds.js`: Background testing
- `add-semantic-classes.js`: Semantic class handling
- `backup-traits.js`: Backup utilities

## Key Components

### 1. SVG Trait Structure
- Traits are organized in numbered directories (01_background, 02_Jaw, etc.)
- Each trait is an SVG file that contains:
  - Multiple paths with semantic ID prefixes (fill-, outline-, shading-)
  - Original colors preserved as inline styles
  - No style blocks (removed during processing)
  - Clean, semantic class names

### 2. Semantic Class System
We use a semantic class system for interactive coloring:
- `outline` - For black outlines/strokes (#000000)
- `fill` - For main fill areas (#FFFFFF)
- `shading` - For areas that provide depth/shading (#AAAAAA with opacity: 0.5)

### 3. Processing Pipeline
The trait processing pipeline:
1. Preserves original colors as inline styles
2. Removes style blocks
3. Assigns semantic classes based on ID prefixes
4. Maintains proper opacity values
5. Removes unnecessary attributes
6. Preserves IDs for positioning

## Processing Rules

### 1. Background SVGs (01_background)
- Skip semantic class processing
- Preserve all original styling
- Keep positioning IDs

### 2. Trait SVGs (02_Jaw through 08_Mouthpiece)
- Apply semantic classes based on ID prefixes
- Preserve original colors as inline styles
- Remove style blocks
- Clean up Adobe artifacts
- Maintain proper opacity values

### 3. ID Naming Convention
- Format: `[type]-[name]`
- Types: fill, outline, shading
- Names: descriptive, lowercase, hyphenated

## Current Status
- ✅ Project organization cleaned and standardized
- ✅ SVG processing pipeline established
- ✅ Semantic class system implemented
- ✅ Color preservation working
- ✅ Background processing separated
- ✅ Test suite updated
- ✅ Documentation current

## Best Practices
1. SVG Creation
   - Use proper ID prefixes
   - Keep paths properly closed
   - Export clean SVGs from Illustrator

2. Processing
   - Always backup traits before processing
   - Test on single files first
   - Verify visual output

3. Generation
   - Check trait combinations
   - Verify style inheritance
   - Test interactive coloring

## NPM Scripts
- `npm run generate`: Generate full collection
- `npm run process:traits`: Process regular traits
- `npm run process:backgrounds`: Process backgrounds
- `npm run test:single-trait`: Test single trait
- `npm run test:backgrounds`: Test backgrounds