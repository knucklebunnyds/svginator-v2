# KBDS Knuckleheads SVG Structure Documentation

## Overview
The KBDS Knuckleheads collection uses a semantic SVG structure with specific classes and IDs to enable dynamic styling and theme switching. Each SVG is composed of multiple layers that combine to create the final artwork.

## Core Structure
Each SVG in the collection follows this basic structure:
```svg
<svg width="1000" height="1000" viewBox="0 0 1000 1000">
    <!-- Background Layer -->
    <!-- Base Layers -->
    <!-- Outline Layers -->
    <!-- Shading Layers -->
</svg>
```

## Semantic Classes
Three main classes are used throughout the SVGs:

1. `.outline` - Used for all outline elements
   - Primary visual boundaries
   - Main character lines
   - Stroke details

2. `.fill` - Used for base color fills
   - Background fills
   - Main color areas
   - Base elements

3. `.shading` - Used for shading and depth
   - Shadow elements
   - Depth indicators
   - Opacity variations

## Layer Organization
Traits are organized in specific categories:
1. Background
2. Head
3. Eyes
4. Mouth
5. Right Ear
6. Left Ear
7. Jaw
8. Face

Each trait category maintains its own layer order and styling hierarchy.

## Theme System
The collection supports dynamic theme switching through CSS variables:
```css
:root {
    --theme-outline: #2E0854;    /* Outline color */
    --theme-fill: #FEFAE0;       /* Fill color */
    --theme-shading: #9B6B9E;    /* Shading color */
    --theme-opacity: 0.45;       /* Shading opacity */
}
```

### Available Themes
1. Default Theme
   - Classic KBDS style
2. Dark Theme
   - High contrast monochrome
3. Neon Theme
   - Vibrant cyberpunk aesthetic
4. Retro Theme
   - Warm vintage colors

## Animation Support
Some backgrounds (like Matrix Rain) include SVG animations using:
- `<animate>` elements
- CSS animations
- Transform properties

## Best Practices
1. Maintain Class Hierarchy
   - Keep outline elements with .outline class
   - Use .fill for base colors
   - Apply .shading for depth elements

2. ID Naming Convention
   - Use descriptive, kebab-case IDs
   - Include trait category prefix
   - Example: `head-rocker-outline`

3. SVG Optimization
   - Remove unnecessary groups
   - Clean up paths
   - Maintain viewBox="0 0 1000 1000"

## Development Notes
1. Theme Switching
   - Always use CSS variables for colors
   - Test all themes before deployment
   - Ensure proper class inheritance

2. Animation Performance
   - Use requestAnimationFrame for JS animations
   - Prefer CSS transforms over other properties
   - Test performance on mobile devices

3. Accessibility
   - Include proper ARIA labels
   - Maintain contrast ratios
   - Provide fallback content

## Common Issues & Solutions
1. Style Inheritance
   - Issue: Colors not updating with theme
   - Solution: Check for !important rules and class specificity

2. Animation Performance
   - Issue: Sluggish animations on mobile
   - Solution: Use transform instead of position properties

3. SVG Scaling
   - Issue: Blurry or pixelated images
   - Solution: Ensure proper viewBox and preserveAspectRatio

## Tools & Resources
1. SVG Optimization
   - SVGO for optimization
   - SVG OMG for quick fixes

2. Animation
   - GreenSock for complex animations
   - CSS animations for simple transitions

3. Development
   - Browser DevTools for debugging
   - SVG validators for structure checking

## Contact & Support
For technical support or questions about the SVG structure:
- Email: support@knucklebunnydeathsquad.com
- Discord: [KBDS Discord Server]
- GitHub: [KBDS Repository] 