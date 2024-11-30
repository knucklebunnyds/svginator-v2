const path = require('path');
const { getTraitNameWithoutRarity } = require('./traitCombiner');
const config = require('./config');

function removeNumericPrefix(category) {
  return category.replace(/^\d+_/, '').replace('Mouthpiece', 'Face');
}

function capitalizeWords(str) {
  return str.replace('mouthpiece', 'face')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function cleanTraitName(traitName) {
  return traitName
    // Remove any prefixes like "Ear Left -" or "mouth-"
    .replace(/^(Ear (Left|Right) -|mouth-|eyes-|face-)/i, '')
    // Remove file extension
    .replace('.svg', '')
    // Replace dashes and underscores with spaces
    .replace(/[-_]/g, ' ')
    // Trim any extra spaces
    .trim()
    // Capitalize first letter of each word
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function generateJSON(tokenId, traits) {
  console.log('Generating JSON for token:', tokenId);
  console.log('Input traits:', traits);
  
  const paddedId = String(tokenId).padStart(4, '0');
  
  const metadata = {
    name: `${config.collectionName} #${paddedId}`,
    image: `${paddedId}.svg`,
    description: config.collectionDescription,
    external_url: "https://knucklebunnydeathsquad.com",
    seller_fee_basis_points: 800, // 8% royalty (800 basis points = 8%)
    
    // Collection info
    collection: {
      name: "Knuckle Bunny Death Squad SVG",
      family: null
    },
    
    // Properties section
    properties: {
      files: [
        {
          uri: `${paddedId}.svg`,
          type: "image/svg+xml"
        }
      ],
      creators: config.creators
    },
    
    // Attributes from traits
    attributes: Object.entries(traits).map(([category, trait]) => ({
      trait_type: capitalizeWords(removeNumericPrefix(category)), // Capitalize each word in the trait type
      value: cleanTraitName(trait)
    })),
    
    compiler: "KBDS SVG Generator"
  };

  console.log('Generated metadata:', metadata);
  return metadata;
}

module.exports = {
  generateJSON
};
