const fs = require('fs-extra');
const path = require('path');

async function backupTraits() {
  try {
    // Get timestamp for backup folder name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Get optional message from command line args
    const message = process.argv[2] || 'routine-backup';
    
    // Create backup folder name
    const backupName = `traits_${timestamp}_${message.replace(/[^a-zA-Z0-9-]/g, '-')}`;
    const backupDir = path.join(__dirname, '..', 'traits_backups', backupName);
    
    // Ensure backup directory exists
    await fs.ensureDir(path.join(__dirname, '..', 'traits_backups'));
    
    // Copy traits to backup
    await fs.copy(
      path.join(__dirname, '..', 'traits'),
      backupDir
    );
    
    console.log(`✅ Traits backed up to: ${backupDir}`);
    
    // Create a manifest file with backup info
    const manifest = {
      timestamp: new Date().toISOString(),
      message,
      backupName,
      traits: {}
    };
    
    // Get list of all trait files
    const categories = await fs.readdir(path.join(__dirname, '..', 'traits'));
    for (const category of categories) {
      const categoryPath = path.join(__dirname, '..', 'traits', category);
      const stats = await fs.stat(categoryPath);
      
      if (stats.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        manifest.traits[category] = files.filter(f => f.endsWith('.svg'));
      }
    }
    
    // Write manifest
    await fs.writeJSON(
      path.join(backupDir, 'manifest.json'),
      manifest,
      { spaces: 2 }
    );
    
    console.log('📝 Backup manifest created');
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

backupTraits(); 