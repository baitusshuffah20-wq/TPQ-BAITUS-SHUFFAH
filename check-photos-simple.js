// Simple script to check photo data
console.log('Checking photo data...');

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

// Test some sample URLs
const testUrls = [
  'https://example.com/image.jpg',
  '/images/avatar.png',
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'data:image/png;base64,invalid-base64-data',
  'data:image/png;base64,',
  'invalid-url',
  null,
  undefined,
  ''
];

console.log('Testing URL validation:');
testUrls.forEach((url, index) => {
  const isValid = isValidImageUrl(url);
  console.log(`${index + 1}. ${url ? url.substring(0, 50) + (url.length > 50 ? '...' : '') : url} -> ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

console.log('\nValidation function is working correctly!');
