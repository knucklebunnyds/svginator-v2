const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

const traitsDir = path.join(__dirname, '..', config.traitsFolder);
const rarityLevels = config.rarityLevels;
const compatibilityRules = config.compatibilityRules;

// Add a Set to store unique combinations
const uniqueCombinations = new Set();

// Track generated traits counts
const traitCounts = {
  global: {},  // Track by rarity level
  byTrait: {}  // Track individual traits
};

// Keep track of generated combinations
const existingCombinations = new Set();

function initializeTraitCounts() {
  // Initialize global rarity counts
  Object.keys(config.raritySystem.levels).forEach(rarity => {
    traitCounts.global[rarity] = 0;
  });

  // Initialize individual trait counts
  Object.entries(config.raritySystem.categoryOverrides).forEach(([category, traits]) => {
    traitCounts.byTrait[category] = {};
    Object.keys(traits).forEach(trait => {
      traitCounts.byTrait[category][trait] = 0;
    });
  });
}

function getTraitRarity(category, traitName) {
  try {
    // Check for category-specific override
    const override = config.raritySystem?.categoryOverrides?.[category]?.[traitName];
    if (override) {
      return {
        level: override.rarity,
        maxSupply: override.maxSupply || 100,
        probability: override.probability || 1,
        weight: override.weight || 100
      };
    }

    // Default to common if no rarity system or levels defined
    const defaultRarity = {
      level: 'common',
      maxSupply: 100,
      probability: 1,
      weight: 100
    };

    // Check for rarity in filename
    const rarityMatch = traitName.match(/_(\w+)\.svg$/);
    if (rarityMatch && config.raritySystem?.levels?.[rarityMatch[1]]) {
      const level = rarityMatch[1];
      return {
        level,
        ...config.raritySystem.levels[level],
        ...defaultRarity
      };
    }

    return defaultRarity;
  } catch (error) {
    console.warn(`Warning: Error getting rarity for ${category}/${traitName}: ${error.message}`);
    return defaultRarity;
  }
}

function canSelectTrait(category, traitName) {
  const rarity = getTraitRarity(category, traitName);
  
  // Check global rarity max supply
  if (traitCounts.global[rarity.level] >= rarity.maxSupply) {
    return false;
  }

  // Check individual trait max supply
  if (traitCounts.byTrait[category]?.[traitName] >= rarity.maxSupply) {
    return false;
  }

  // Check probability
  return Math.random() <= rarity.probability;
}

function updateTraitCounts(category, traitName) {
  const rarity = getTraitRarity(category, traitName);
  
  // Update global rarity count
  traitCounts.global[rarity.level]++;

  // Update individual trait count
  if (!traitCounts.byTrait[category]) {
    traitCounts.byTrait[category] = {};
  }
  traitCounts.byTrait[category][traitName] = 
    (traitCounts.byTrait[category][traitName] || 0) + 1;
}

function selectTraitByRarity(category, availableTraits) {
  try {
    // Log available traits for debugging
    console.log(`Selecting trait for ${category}. Available traits:`, availableTraits);
    
    if (!availableTraits || availableTraits.length === 0) {
      console.warn(`No traits available for ${category}`);
      return null;
    }

    // If no valid traits after rarity check, fall back to any available trait
    const validTraits = availableTraits.filter(trait => 
      canSelectTrait(category, trait)
    );

    if (validTraits.length === 0) {
      console.log(`No traits passed rarity check for ${category}, using fallback selection`);
      return availableTraits[Math.floor(Math.random() * availableTraits.length)];
    }

    // Calculate total weight of valid traits
    const totalWeight = validTraits.reduce((sum, trait) => {
      const rarity = getTraitRarity(category, trait);
      return sum + (rarity.weight || 1);
    }, 0);

    // Select trait based on weight
    let random = Math.random() * totalWeight;
    for (const trait of validTraits) {
      const rarity = getTraitRarity(category, trait);
      if (random <= (rarity.weight || 1)) {
        return trait;
      }
      random -= (rarity.weight || 1);
    }

    return validTraits[validTraits.length - 1];
  } catch (error) {
    console.warn(`Error in selectTraitByRarity for ${category}:`, error);
    // Fallback to random selection
    return availableTraits[Math.floor(Math.random() * availableTraits.length)];
  }
}

function isCompatible(selectedTraits, category, trait) {
  const rules = config.compatibilityRules[category];
  if (!rules) return true;

  const traitName = getTraitNameWithoutRarity(trait);

  // Check exclusions
  if (rules.exclusions && rules.exclusions[traitName]) {
    for (const [cat, selectedTrait] of Object.entries(selectedTraits)) {
      const selectedTraitName = getTraitNameWithoutRarity(selectedTrait);
      if (rules.exclusions[traitName].includes(selectedTraitName)) {
        return false;
      }
    }
  }

  // Check required pairings
  if (rules.requiredPairings && rules.requiredPairings[traitName]) {
    const requiredTraits = rules.requiredPairings[traitName];
    const hasRequiredTrait = Object.values(selectedTraits).some(selectedTrait => 
      requiredTraits.includes(getTraitNameWithoutRarity(selectedTrait))
    );
    if (!hasRequiredTrait) return false;
  }

  return true;
}

function getCategoriesSorted() {
  return config.traitOrder;
}

async function combineTraits() {
  const selectedTraits = {};
  const categories = getCategoriesSorted();

  for (const category of categories) {
    const traitFiles = await getTraitFiles(category);
    let selectedTrait;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loop

    do {
      selectedTrait = selectTraitByRarity(category, traitFiles);
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error(`Unable to find compatible trait for ${category} after ${maxAttempts} attempts`);
      }
    } while (!isCompatible(selectedTraits, category, selectedTrait));

    selectedTraits[category] = selectedTrait;
  }

  // Final check for required pairings
  for (const [category, trait] of Object.entries(selectedTraits)) {
    const rules = config.compatibilityRules[category];
    if (rules && rules.requiredPairings) {
      const traitName = getTraitNameWithoutRarity(trait);
      if (rules.requiredPairings[traitName]) {
        const requiredTraits = rules.requiredPairings[traitName];
        const hasRequiredTrait = Object.values(selectedTraits).some(selectedTrait => 
          requiredTraits.includes(getTraitNameWithoutRarity(selectedTrait))
        );
        if (!hasRequiredTrait) {
          return combineTraits(); // Retry if required pairing is not met
        }
      }
    }
  }

  return selectedTraits;
}

async function generateTraitCombination() {
  let traits = {};
  let retryCount = 0;
  const maxRetries = 100;

  while (retryCount < maxRetries) {
    try {
      for (const category of config.traitOrder || []) {
        if (shouldSkipTrait(category)) {
          console.log(`Skipping optional category: ${category}`);
          continue;
        }

        const traitFiles = await getTraitFiles(category);
        console.log(`Category ${category} has ${traitFiles.length} traits available`);

        if (traitFiles.length === 0) {
          if (isTraitRequired(category)) {
            throw new Error(`No traits found for required category: ${category}`);
          }
          console.log(`Skipping empty category: ${category}`);
          continue;
        }

        let validTrait = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!validTrait && attempts < maxAttempts) {
          const selectedTrait = selectTraitByRarity(category, traitFiles);
          
          if (selectedTrait && 
              checkExclusions(traits, category, selectedTrait) &&
              checkMutualExclusions(traits, category, selectedTrait) &&
              checkRequiredCombinations(traits, category, selectedTrait)) {
            
            traits[category] = selectedTrait;
            validTrait = true;
            console.log(`Selected trait for ${category}: ${selectedTrait}`);
          } else {
            console.log(`Trait ${selectedTrait} failed compatibility check for ${category}`);
          }
          
          attempts++;
        }

        if (!validTrait && isTraitRequired(category)) {
          throw new Error(`Could not find valid trait for ${category}`);
        }
      }

      // Final validation of all required combinations
      let validCombination = true;
      for (const [category, trait] of Object.entries(traits)) {
        if (!checkRequiredCombinations(traits, category, trait)) {
          validCombination = false;
          break;
        }
      }

      if (validCombination) {
        return traits;
      }

      retryCount++;
    } catch (error) {
      console.log(`Attempt ${retryCount + 1} failed: ${error.message}`);
      retryCount++;
      // Reset traits for next attempt
      traits = {};
    }
  }

  throw new Error(`Failed to generate valid trait combination after ${maxRetries} attempts`);
}

function checkCompatibility(traits) {
  // Implement compatibility rules here if needed
  return true;
}

async function generateUniqueCombination() {
  let traits = {};
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    traits = await generateTraitCombination();
    const combinationKey = JSON.stringify(traits);

    if (!existingCombinations.has(combinationKey)) {
      existingCombinations.add(combinationKey);
      return traits;
    }

    attempts++;
  }

  throw new Error('Could not generate unique combination after ' + maxAttempts + ' attempts');
}

function getTraitNameWithoutRarity(traitFileName) {
  return path.basename(traitFileName, '.svg').replace(/_(?:common|uncommon|rare|legendary)$/, '');
}

function resetUniqueCombinations() {
  uniqueCombinations.clear();
}

function isTraitRequired(category) {
  return config.traitCategories[category]?.required ?? true;
}

function shouldSkipTrait(category) {
  const categoryConfig = config.traitCategories[category];
  if (!categoryConfig || categoryConfig.required) return false;
  return Math.random() < (categoryConfig.emptyProbability || 0);
}

function checkExclusions(selectedTraits, category, trait) {
  // Add debug logging
  console.log('Checking exclusions for:', {
    category,
    trait,
    selectedTraits
  });

  const rules = config.compatibilityRules.exclusions[category];
  if (!rules) {
    console.log(`No exclusion rules found for category ${category}`);
    return true;
  }

  // Remove .svg extension for comparison
  const traitWithoutExt = trait.replace('.svg', '');
  
  if (!rules[traitWithoutExt]) {
    console.log(`No exclusion rules found for trait ${traitWithoutExt} in category ${category}`);
    return true;
  }

  const exclusions = rules[traitWithoutExt].excludes;
  for (const [excludedCategory, excludedTraits] of Object.entries(exclusions)) {
    if (selectedTraits[excludedCategory]) {
      const selectedTraitWithoutExt = selectedTraits[excludedCategory].replace('.svg', '');
      if (excludedTraits.includes(selectedTraitWithoutExt)) {
        console.log(`Exclusion found: ${category}/${trait} excludes ${excludedCategory}/${selectedTraits[excludedCategory]}`);
        return false;
      }
    }
  }
  
  return true;
}

function checkMutualExclusions(selectedTraits, category, trait) {
  const mutualExclusions = config.compatibilityRules.mutualExclusions;
  const traitWithoutRarity = getTraitNameWithoutRarity(trait);

  for (const rule of mutualExclusions) {
    if (rule.trait1.category === category && rule.trait1.name === traitWithoutRarity) {
      const otherCategory = rule.trait2.category;
      if (selectedTraits[otherCategory] && 
          getTraitNameWithoutRarity(selectedTraits[otherCategory]) === rule.trait2.name) {
        return false;
      }
    }
    if (rule.trait2.category === category && rule.trait2.name === traitWithoutRarity) {
      const otherCategory = rule.trait1.category;
      if (selectedTraits[otherCategory] && 
          getTraitNameWithoutRarity(selectedTraits[otherCategory]) === rule.trait1.name) {
        return false;
      }
    }
  }
  return true;
}

function checkRequiredCombinations(selectedTraits, category, trait) {
  try {
    // If no required combinations defined, return true
    if (!config.compatibilityRules?.requiredCombinations) {
      return true;
    }

    const rules = config.compatibilityRules.requiredCombinations[category];
    if (!rules || !rules[getTraitNameWithoutRarity(trait)]) {
      return true;
    }

    const requirements = rules[getTraitNameWithoutRarity(trait)].requires;
    
    // Check if all required traits are present
    for (const [reqCategory, reqTraits] of Object.entries(requirements)) {
      // If the required category is the one we're currently selecting for, skip it
      if (reqCategory === category) continue;

      // If we don't have the required category selected yet, we can't validate
      if (!selectedTraits[reqCategory]) {
        console.log(`Required category ${reqCategory} not yet selected for ${trait}`);
        return false;
      }

      // Check if the selected trait matches any of the required traits
      const selectedTrait = getTraitNameWithoutRarity(selectedTraits[reqCategory]);
      if (!reqTraits.includes(selectedTrait)) {
        console.log(`Trait ${trait} requires one of [${reqTraits.join(', ')}] in ${reqCategory}, but found ${selectedTrait}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn(`Error checking required combinations for ${category}/${trait}:`, error);
    return true; // On error, allow the trait
  }
}

// Add rarity reporting function
async function generateRarityReport() {
  console.log('\nGenerating rarity report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    collectionSize: config.collectionSize,
    globalRarityDistribution: {},
    traitDistribution: {}
  };

  // Global rarity counts
  Object.entries(traitCounts.global).forEach(([rarity, count]) => {
    report.globalRarityDistribution[rarity] = {
      count,
      maxSupply: config.raritySystem?.levels?.[rarity]?.maxSupply || 'unlimited',
      percentage: ((count/config.collectionSize) * 100).toFixed(2) + '%'
    };
  });

  // Individual trait counts
  Object.entries(traitCounts.byTrait).forEach(([category, traits]) => {
    report.traitDistribution[category] = {};
    Object.entries(traits).forEach(([trait, count]) => {
      const rarity = getTraitRarity(category, trait);
      report.traitDistribution[category][trait] = {
        count,
        maxSupply: rarity.maxSupply,
        rarity: rarity.level,
        percentage: ((count/config.collectionSize) * 100).toFixed(2) + '%'
      };
    });
  });

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'output');
  const reportPath = path.join(outputDir, 'rarity_report.json');
  
  try {
    console.log(`Ensuring output directory exists: ${outputDir}`);
    await fs.ensureDir(outputDir);
    
    console.log(`Writing rarity report to: ${reportPath}`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('Rarity report generated successfully');
    
    // Also log the report to console for immediate feedback
    console.log('\nRarity Report Summary:');
    console.log(JSON.stringify(report, null, 2));
    
  } catch (error) {
    console.error('Error writing rarity report:', error);
    console.error(error.stack);
  }
}

// Initialize counts when module is loaded
initializeTraitCounts();

// Add the missing getTraitFiles function
async function getTraitFiles(category) {
  try {
    const categoryPath = path.join(traitsDir, category);
    if (!await fs.pathExists(categoryPath)) {
      console.warn(`Warning: Category path ${category} does not exist`);
      return [];
    }
    
    const files = await fs.readdir(categoryPath);
    return files.filter(file => file.toLowerCase().endsWith('.svg'));
  } catch (error) {
    console.warn(`Warning: Error reading traits for ${category}: ${error.message}`);
    return [];
  }
}

module.exports = { 
  combineTraits, 
  resetUniqueCombinations, 
  getTraitNameWithoutRarity,
  getCategoriesSorted, 
  generateTraitCombination,
  checkCompatibility,
  generateUniqueCombination,
  generateRarityReport
};
