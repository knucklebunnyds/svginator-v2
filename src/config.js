const path = require('path');
const fs = require('fs');

// Base configuration
const config = {
  collectionName: "KBDS Doge Knuckleheads",
  collectionDescription: "Straight out tha Burrows - A unique collection of Doge Knuckleheads, each reppin' its own quirky attitude and style.",
  collectionSize: 300,
  
  // Folders
  traitsFolder: 'traits',
  outputFolder: 'output',
  
  // Canvas settings
  canvasSize: { 
    width: 2048, 
    height: 2048 
  },

  // Semantic colors for SVG manipulation
  semanticColors: {
    outline: '#FF00FF',  // Hot pink for outlines
    fill: '#00FFFF',     // Cyan for fills
    shading: {
      color: '#FFD700',  // Gold for shading
      opacity: 0.8       // Higher opacity to make shading more visible
    }
  },

  // Get trait categories dynamically
  get traitOrder() {
    const traitPath = path.join(__dirname, '..', this.traitsFolder);
    return fs.readdirSync(traitPath)
      .filter(file => fs.statSync(path.join(traitPath, file)).isDirectory())
      .sort((a, b) => {
        const aNum = parseInt(a.split('_')[0]);
        const bNum = parseInt(b.split('_')[0]);
        return aNum - bNum;
      });
  },

  // Trait categories configuration
  traitCategories: {
    "01_background": {
      required: true
    },
    "02_Jaw": {
      required: true
    },
    "03_Eyes": {
      required: true
    },
    "04_Left Ear": {
      required: true
    },
    "05_Right Ear": {
      required: true
    },
    "06_Head": {
      required: false,
      emptyProbability: 0.2  // 20% chance of no head trait
    },
    "07_Mouth": {
      required: true
    },
    "08_Mouthpiece": {
      required: false,
      emptyProbability: 0.5  // 50% chance of no Mouthpiece trait
    }
  },

  // Compatibility rules
  compatibilityRules: {
    exclusions: {
      "07_Head": {
        "steampunk-goggles": {
          excludes: {
            "04_Eyes": ["aviators", "beaker", "navigators", "monacle", "lennon", "specs", "starchild", "steampunk-goggles", "viper", "wayfairer"]
          }
        },
        "steampunk-hatter": {
          excludes: {
            "04_Eyes": ["aviators", "beaker", "navigators", "monacle", "lennon", "specs", "starchild", "steampunk-goggles", "viper", "wayfairer"]
          }
        }
      },
      "04_Eyes": {
        "monacle": {
          excludes: {
            "07_head": ["alien", "banger", "beanie", "darkhawk", "dreads", "hatflip", "hippy", "jah-mon", "rastacap", "sideways-hat", "small-hawk", "spiked", "tall-hawk"]
          }
        }
      },
      "08_Mouthpiece": {
        "hombre": {
          excludes: {
            "07_Head": ["alien", "banger", "beanie", "darkhawk", "dreads", "hatflip", "hippy", "jah-mon", "rastacap", "sideways-hat", "small-hawk", "spiked", "tall-hawk"]
          }
        },
        "stache": {
          excludes: {
            "04_Eyes": ["aviators", "beaker", "navigators", "lennon", "viper", "wayfairer", "monacle"],
            "07_Head": ["banger", "jah-mon", "rastacap"]
          }
        },
        "bearded": {
          excludes: {
            "04_Eyes": ["aviators", "beaker", "navigators", "lennon", "specs", "steampunk-goggles", "viper", "wayfairer", "monacle"],
            "07_Head": ["banger", "jah-mon", "rastacap"]
          }
        },
        "outlaw": {
          excludes: {
            "07_Head": ["banger", "jah-mon", "rastacap"]
          }
        },
        "gasmask": {
          excludes: {
            "07_Head": ["banger", "jah-mon", "rastacap"]
          }
        },
        "biker-beard": {
          excludes: {
            "07_Head": ["banger", "jah-mon", "rastacap"]
          }
        }
      },
      "02_Jaw": {
        "doom-raider-mask": {
          excludes: {
            "07_Head": ["dreads", "hippy", "jah-mon", "rocker-hat", "rockerdo"]
          }
        }
      }
    },

    // Mutual exclusions array
    mutualExclusions: [
      {
        trait1: { category: "03_Eyes", name: "3D_glasses" },
        trait2: { category: "06_Head", name: "VR_headset" }
      }
    ],

    // Required combinations
    requiredCombinations: {
      "06_Head": {
        "crown": {
          requires: {
            "07_Mouth": ["royal_beard", "smirk"]
          }
        }
      }
    }
  },

  // Rarity system
  raritySystem: {
    // Global rarity levels
    levels: {
      common: {
        weight: 100,
        maxSupply: 80,
        probability: 0.5
      },
      uncommon: {
        weight: 40,
        maxSupply: 50,
        probability: 0.3
      },
      rare: {
        weight: 15,
        maxSupply: 20,
        probability: 0.15
      },
      legendary: {
        weight: 5,
        maxSupply: 10,
        probability: 0.05
      }
    },

    // Category-specific overrides
    categoryOverrides: {
      "06_Head": {
        "crown": {
          rarity: "legendary",
          maxSupply: 5,
          probability: 0.03
        },
        "mohawk": {
          rarity: "rare",
          maxSupply: 15
        }
      },
      "03_Eyes": {
        "3D_glasses": {
          rarity: "uncommon",
          maxSupply: 30
        }
      }
    }
  },

  // Collection metadata
  externalUrl: "https://knucklebunnydeathsquad.com",
  sellerFeeBasisPoints: 500, // 5% royalty
  
  collection: {
    name: "Knuckle Bunny Death Squad SVG",
    family: null
  },
  
  creators: [
    {
      share: 100,
      address: "DTxJrTzMVQqpYAtEEdYhSCJufCQEZk2ZUd"
    }
  ]
};

module.exports = config;
