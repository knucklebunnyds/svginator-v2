const config = require('./config');
const SVGNFTGenerator = require('./svgNFTGenerator');

// Create generator instance
const generator = new SVGNFTGenerator(config);

// Generate collection
generator.generateCollection()
  .then(() => console.log('Collection generation complete'))
  .catch(error => console.error('Error generating collection:', error));
