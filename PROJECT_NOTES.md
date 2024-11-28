# SVGinator v2 Project Notes

## Project Overview
SVGinator v2 is an NFT generation system that combines SVG trait layers to create unique NFTs with interactive coloring capabilities.

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
- `outline` - For black outlines/strokes
- `fill` - For main fill areas
- `shading` - For areas that provide depth/shading (opacity: 0.5)

### 3. Processing Pipeline
The `process-svg.js` script handles trait processing:
1. Preserves original colors as inline styles
2. Removes style blocks
3. Assigns semantic classes based on ID prefixes
4. Maintains proper opacity values
5. Removes unnecessary attributes
6. Preserves IDs for positioning

## Script Documentation

### Core Processing Scripts
1. `process-svg.js`
   - Main SVG processing script
   - Handles semantic class assignment
   - Manages default styles and colors
   - Cleans up unnecessary attributes

2. `test-process-svg.js`
   - Test suite for SVG processing
   - Processes multiple trait files
   - Provides detailed feedback

### Utility Scripts
1. `check-id-prefixes.js`
   - Scans for non-standard ID prefixes
   - Helps maintain consistent naming

2. `check-layer1-ids.js`
   - Identifies Adobe Layer_1 artifacts
   - Helps clean up Illustrator exports

3. `clean-adobe-artifacts.js`
   - Removes Adobe-specific metadata
   - Cleans up namespace declarations

### Test Scripts
1. `test-path.js`
   - Tests individual path processing
   - Validates semantic class application

2. `test-svg.js`
   - Tests full SVG file processing
   - Validates style preservation

## Current Status
- ✅ SVG processing pipeline established
- ✅ Semantic class system implemented
- ✅ Color preservation working
- ✅ Adobe artifact cleanup automated
- ✅ Test suite created
- ✅ Documentation updated

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

## Next Steps
1. Test full NFT generation pipeline
2. Implement external CSS handling
3. Add trait rarity system
4. Create interactive coloring UI

## Known Issues
- None currently - all major processing issues resolved

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