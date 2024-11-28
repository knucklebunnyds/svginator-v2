# SVGINATOR v2

A tool for processing and combining SVG trait files for NFT projects with interactive coloring capabilities.

## Project Structure

```
.
├── traits/              # Source SVG trait files organized by category
├── output/             # Generated output files
├── process-svg.js      # Main SVG processing script
├── test-process-svg.js # Test script for SVG processing
└── package.json        # Project dependencies and scripts
```

## Core Scripts

### process-svg.js
Main script for processing SVG files. Handles:
- Semantic class assignment (fill, outline, shading)
- Default style application
- Illustrator artifact cleanup
- Style block processing
- ID standardization

Key features:
- Preserves original colors and opacities
- Converts Illustrator classes to semantic classes
- Maintains proper opacity values (e.g., shading at 0.5)
- Removes unnecessary attributes and style blocks

### test-process-svg.js
Test suite for validating SVG processing across multiple trait files.
- Tests multiple trait categories
- Provides detailed processing feedback
- Helps identify potential issues

## SVG Processing Rules

### Semantic Classes
- `fill`: Main fill areas (default: #FFFFFF)
- `outline`: Stroke/outline elements (default: #000000)
- `shading`: Shadow/shading elements (default: #AAAAAA with 0.5 opacity)

### ID Conventions
IDs follow the pattern: `[type]-[name]`
Example: `fill-body`, `outline-head`, `shading-arm`

### Background SVGs
- No semantic classes needed
- Preserve original styling
- Keep IDs for positioning

## Usage

1. Install dependencies:
```bash
npm install
```

2. Process SVG files:
```bash
npm run test:process
```

3. Generate combinations:
```bash
npm run generate
```

## Development Notes

- All SVGs should be properly closed with matching tags
- Background SVGs are handled differently from trait SVGs
- Original colors and opacities are preserved during processing
- Illustrator-specific classes (st0, st1, etc.) are converted to semantic classes 