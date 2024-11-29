# SVGINATOR v2

A tool for processing and combining SVG trait files for NFT projects with interactive coloring capabilities.

## Project Structure

```
.
├── src/                # Core functionality
│   ├── index.js       # Entry point
│   ├── config.js      # Configuration
│   ├── svgNFTGenerator.js  # NFT generation
│   ├── traitCombiner.js    # Trait combination logic
│   └── jsonGenerator.js    # Metadata generation
│
├── scripts/           # Utility scripts
│   ├── process-traits.js     # Main trait processing
│   ├── process-backgrounds.js # Background processing
│   ├── test-backgrounds.js   # Background testing
│   └── add-semantic-classes.js # Semantic class handling
│
├── traits/           # Source SVG trait files by category
├── output/          # Generated output files
└── package.json     # Dependencies and scripts
```

## Core Components

### Generation (/src)
- `svgNFTGenerator.js`: Main NFT generation engine
- `traitCombiner.js`: Handles trait combinations and rarity
- `jsonGenerator.js`: Generates NFT metadata
- `config.js`: Project configuration

### Processing (/scripts)
- `process-traits.js`: Main trait processing script
- `process-backgrounds.js`: Background-specific processing
- `add-semantic-classes.js`: Semantic class management

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

2. Process trait files:
```bash
npm run process:traits    # Process regular traits
npm run process:backgrounds  # Process backgrounds
```

3. Test processing:
```bash
npm run test:single-trait  # Test single trait
npm run test:backgrounds   # Test backgrounds
```

4. Generate collection:
```bash
npm run generate
```

## Development Notes

- All SVGs should be properly closed with matching tags
- Background SVGs are handled differently from trait SVGs
- Original colors are preserved as inline styles
- Illustrator-specific classes (st0, st1, etc.) are converted to semantic classes
- Each trait type maintains proper opacity values
- Shading elements always use opacity: 0.5