const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const SVGNFTGenerator = require('./svgNFTGenerator');

async function testSingleTrait() {
    // Create generator instance
    const generator = new SVGNFTGenerator(config);

    // Test with aviators trait
    const testTraits = {
        '04_Eyes': 'aviators.svg'
    };

    try {
        console.log('\nTesting single trait generation with:', testTraits);
        const svgContent = await generator.generateSingleSVG(testTraits);
        
        // Create test output directory if it doesn't exist
        const testOutputDir = path.join(__dirname, '..', 'test-output');
        await fs.ensureDir(testOutputDir);
        
        // Write to a descriptively named file
        const testOutputPath = path.join(testOutputDir, 'single-trait-aviators.svg');
        await fs.writeFile(testOutputPath, svgContent);
        
        console.log('✓ Test successful');
        console.log('Output saved to:', path.relative(process.cwd(), testOutputPath));
        console.log('\nSVG content preview:');
        console.log(svgContent.substring(0, 500) + '...\n');
    } catch (error) {
        console.error('✗ Test failed:', error);
    }
}

testSingleTrait().catch(console.error); 