const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "db_tpq",
};

// Function to validate image URL
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Check for valid HTTP/HTTPS URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // Check for valid local paths
  if (url.startsWith('/')) {
    return true;
  }
  
  // Check for valid data URLs
  if (url.startsWith('data:image/')) {
    try {
      // Basic validation for data URL format
      const parts = url.split(',');
      if (parts.length !== 2) return false;
      
      const header = parts[0];
      const data = parts[1];
      
      // Check header format
      if (!header.includes('data:image/') || !header.includes('base64')) return false;
      
      // Check if base64 data is valid (basic check)
      if (!data || data.length === 0) return false;
      
      // Try to validate base64 format
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      return base64Regex.test(data);
    } catch (error) {
      console.error('Invalid data URL:', error);
      return false;
    }
  }
  
  return false;
}

async function cleanInvalidPhotos() {
  let connection = null;
  
  try {
    console.log('🔍 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    // Check santri photos
    console.log('📸 Checking santri photos...');
    const [santriRows] = await connection.execute(
      'SELECT id, name, photo FROM santri WHERE photo IS NOT NULL AND photo != ""'
    );
    
    let invalidSantriCount = 0;
    const invalidSantriIds = [];
    
    for (const row of santriRows) {
      if (!isValidImageUrl(row.photo)) {
        console.log(`❌ Invalid photo for santri ${row.name} (${row.id}): ${row.photo.substring(0, 50)}...`);
        invalidSantriIds.push(row.id);
        invalidSantriCount++;
      }
    }
    
    // Clean invalid santri photos
    if (invalidSantriIds.length > 0) {
      console.log(`🧹 Cleaning ${invalidSantriIds.length} invalid santri photos...`);
      await connection.execute(
        `UPDATE santri SET photo = NULL WHERE id IN (${invalidSantriIds.map(() => '?').join(',')})`,
        invalidSantriIds
      );
      console.log('✅ Santri photos cleaned');
    } else {
      console.log('✅ All santri photos are valid');
    }
    
    // Check musyrif photos
    console.log('👨‍🏫 Checking musyrif photos...');
    try {
      const [musyrifRows] = await connection.execute(
        'SELECT id, name, photo FROM musyrif WHERE photo IS NOT NULL AND photo != ""'
      );
      
      let invalidMusyrifCount = 0;
      const invalidMusyrifIds = [];
      
      for (const row of musyrifRows) {
        if (!isValidImageUrl(row.photo)) {
          console.log(`❌ Invalid photo for musyrif ${row.name} (${row.id}): ${row.photo.substring(0, 50)}...`);
          invalidMusyrifIds.push(row.id);
          invalidMusyrifCount++;
        }
      }
      
      // Clean invalid musyrif photos
      if (invalidMusyrifIds.length > 0) {
        console.log(`🧹 Cleaning ${invalidMusyrifIds.length} invalid musyrif photos...`);
        await connection.execute(
          `UPDATE musyrif SET photo = NULL WHERE id IN (${invalidMusyrifIds.map(() => '?').join(',')})`,
          invalidMusyrifIds
        );
        console.log('✅ Musyrif photos cleaned');
      } else {
        console.log('✅ All musyrif photos are valid');
      }
    } catch (error) {
      console.log('ℹ️ Musyrif table does not exist or has no photo column');
    }
    
    // Check user avatars
    console.log('👤 Checking user avatars...');
    try {
      const [userRows] = await connection.execute(
        'SELECT id, name, avatar FROM users WHERE avatar IS NOT NULL AND avatar != ""'
      );
      
      let invalidUserCount = 0;
      const invalidUserIds = [];
      
      for (const row of userRows) {
        if (!isValidImageUrl(row.avatar)) {
          console.log(`❌ Invalid avatar for user ${row.name} (${row.id}): ${row.avatar.substring(0, 50)}...`);
          invalidUserIds.push(row.id);
          invalidUserCount++;
        }
      }
      
      // Clean invalid user avatars
      if (invalidUserIds.length > 0) {
        console.log(`🧹 Cleaning ${invalidUserIds.length} invalid user avatars...`);
        await connection.execute(
          `UPDATE users SET avatar = NULL WHERE id IN (${invalidUserIds.map(() => '?').join(',')})`,
          invalidUserIds
        );
        console.log('✅ User avatars cleaned');
      } else {
        console.log('✅ All user avatars are valid');
      }
    } catch (error) {
      console.log('ℹ️ Users table does not exist or has no avatar column');
    }
    
    console.log('🎉 Photo cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during photo cleanup:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the cleanup
cleanInvalidPhotos();
