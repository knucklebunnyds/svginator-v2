const { testFile } = require('./process-traits.js');

const filesToProcess = [
  'traits/04_Eyes/half-robo-righty.svg',
  'traits/04_Eyes/navigators.svg',
  'traits/04_Eyes/OG-bandaid.svg',
  'traits/02_Jaw/OG.svg',
  'traits/07_Head/garden tophat.svg',
  'traits/07_Head/hippy.svg',
  'traits/07_Head/rockerdo.svg',
  'traits/07_Head/steampunk-hatter.svg',
  'traits/07_Head/tophat.svg',
  'traits/08_Mouthpiece/gasmask.svg'
];

console.log('Processing multiple trait files...\n');

filesToProcess.forEach((file, index) => {
  console.log(`[${index + 1}/${filesToProcess.length}] Processing ${file}...`);
  try {
    testFile(file);
    console.log('✓ Success\n');
  } catch (error) {
    console.error(`✗ Error: ${error.message}\n`);
  }
});