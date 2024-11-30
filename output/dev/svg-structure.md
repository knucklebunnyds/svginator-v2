# KBDS Knuckleheads SVG Structure Documentation

## Overview
Each NFT is composed of multiple SVG elements organized in a semantic structure. This document outlines the classes, IDs, and structure available for styling through the coloring app.

## Base Structure
```svg
<svg viewBox="0 0 2048 2048">
  <g class="trait-group" data-category="[category]" id="[category]-[trait]">
    <!-- Trait elements -->
  </g>
</svg>
```

## Class Structure

### Core Classes
- `.outline` - Defines the outline/stroke elements
- `.fill` - Defines the main fill areas
- `.shading` - Defines shading and highlight areas
- `.color` - Used for background and special color elements
- `.trait-group` - Container for each trait group

### Background Classes
- `.background` - Base class for background elements
- Background-specific pattern classes:
  - `#halftone-pattern`
  - `#zigzag-pattern`
  - `#circuit-pattern`
  - `#scanline-pattern`
  - `#camo-pattern`
  - `#dots-pattern`

### Gradient Classes
- `#purple-haze-gradient`
- `#ocean-depths-gradient`
- `#forest-mist-gradient`
- `#sunset-glow-gradient`

## ID Structure
IDs follow the pattern: `[category]-[trait]`

Categories:
1. `background`
2. `jaw`
3. `mouth`
4. `eyes`
5. `right-ear`
6. `left-ear`
7. `head`
8. `mouthpiece` (optional)

Example: `id="eyes-aviators"`

## Data Attributes
- `data-category`: Identifies the trait category
- `data-original-prefix`: Preserves original ID prefix information

## Style Hierarchy
1. Base styles (defined in semantic.css)
2. Category-specific styles
3. Trait-specific styles
4. Interactive states (hover, active)

## Example
```svg
<g class="trait-group" data-category="eyes" id="eyes-aviators">
  <path class="outline" d="..."/>
  <path class="fill" d="..."/>
  <path class="shading" d="..."/>
</g>
```

## Background Patterns
All background patterns are contained within `<defs>` and can be styled using the `.color` class:

```svg
<defs>
  <pattern id="pattern-name" ...>
    <path class="color" .../>
  </pattern>
</defs>
<rect class="color" fill="url(#pattern-name)"/>
```

## Style Targeting Examples
```css
/* Target all outlines */
.outline {
  fill: #000000;
}

/* Target specific trait outlines */
#eyes-aviators .outline {
  fill: #333333;
}

/* Target all shading in a category */
[data-category="mouth"] .shading {
  opacity: 0.5;
}

/* Target background patterns */
.background .color {
  fill: #fbc533;
}
```

## Notes
1. All paths use the `fill` attribute for coloring (no `stroke` attributes)
2. Shading elements may have both `fill` and `opacity` attributes
3. Background patterns can be colored by targeting the `.color` class
4. Trait groups can be targeted by category using the `data-category` attribute
5. Individual traits can be targeted using their specific IDs 