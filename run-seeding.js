// Using built-in fetch in Node.js 18+

async function runSeeding() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🌱 Starting seeding process...');
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    const dbTest = await fetch(`${baseUrl}/api/test-db-connection`);
    const dbResult = await dbTest.json();
    console.log('Database test result:', dbResult);
    
    // 2. Seed Programs
    console.log('2️⃣ Seeding programs...');
    const programsResponse = await fetch(`${baseUrl}/api/seed/programs`, { method: 'POST' });
    const programsResult = await programsResponse.json();
    console.log('Programs seeding result:', programsResult);
    
    // 3. Seed Donation Categories
    console.log('3️⃣ Seeding donation categories...');
    const categoriesResponse = await fetch(`${baseUrl}/api/seed/donation-categories`, { method: 'POST' });
    const categoriesResult = await categoriesResponse.json();
    console.log('Categories seeding result:', categoriesResult);
    
    // 4. Seed Donation Campaigns
    console.log('4️⃣ Seeding donation campaigns...');
    const campaignsResponse = await fetch(`${baseUrl}/api/seed/donation-campaigns`, { method: 'POST' });
    const campaignsResult = await campaignsResponse.json();
    console.log('Campaigns seeding result:', campaignsResult);
    
    // 5. Create Sample Data
    console.log('5️⃣ Creating sample data...');
    const sampleResponse = await fetch(`${baseUrl}/api/dashboard/create-sample-data`, { method: 'POST' });
    const sampleResult = await sampleResponse.json();
    console.log('Sample data result:', sampleResult);
    
    console.log('✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

runSeeding();
