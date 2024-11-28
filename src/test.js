const fs = require('fs-extra');
const path = require('path');
const { generateSVG } = require('./svgGenerator');

async function testSingleSVG() {
    // Test with a single trait combination
    const testTraits = {
        '04_Eyes': 'aviators.svg'  // Using aviators as our test case
    };

    try {
        console.log('Testing SVG generation with traits:', testTraits);
        const svgContent = await generateSVG(testTraits);
        
        // Write the output to a test file
        const testOutputPath = path.join(__dirname, '..', 'output', 'test-output.svg');
        await fs.writeFile(testOutputPath, svgContent);
        
        console.log('Test SVG written to:', testOutputPath);
        console.log('SVG content preview:', svgContent.substring(0, 500) + '...');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSingleSVG().catch(console.error); 