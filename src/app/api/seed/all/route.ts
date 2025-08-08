import { NextResponse } from "next/server";

export async function POST() {
  try {
    const results = [];
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // 1. Seed Programs
    console.log("Seeding programs...");
    const programsResponse = await fetch(`${baseUrl}/api/seed/programs`, {
      method: 'POST',
    });
    const programsResult = await programsResponse.json();
    results.push({
      step: 1,
      name: "Programs",
      success: programsResult.success,
      message: programsResult.message,
      count: programsResult.success ? programsResult.programs?.length : 0,
      error: programsResult.error,
    });

    // 2. Seed Donation Categories
    console.log("Seeding donation categories...");
    const categoriesResponse = await fetch(`${baseUrl}/api/seed/donation-categories`, {
      method: 'POST',
    });
    const categoriesResult = await categoriesResponse.json();
    results.push({
      step: 2,
      name: "Donation Categories",
      success: categoriesResult.success,
      message: categoriesResult.message,
      count: categoriesResult.success ? categoriesResult.categories?.length : 0,
      error: categoriesResult.error,
    });

    // 3. Seed Donation Campaigns (depends on categories)
    if (categoriesResult.success) {
      console.log("Seeding donation campaigns...");
      const campaignsResponse = await fetch(`${baseUrl}/api/seed/donation-campaigns`, {
        method: 'POST',
      });
      const campaignsResult = await campaignsResponse.json();
      results.push({
        step: 3,
        name: "Donation Campaigns",
        success: campaignsResult.success,
        message: campaignsResult.message,
        count: campaignsResult.success ? campaignsResult.campaigns?.length : 0,
        error: campaignsResult.error,
      });
    } else {
      results.push({
        step: 3,
        name: "Donation Campaigns",
        success: false,
        message: "Skipped due to categories seeding failure",
        count: 0,
        error: "Donation categories must be seeded first",
      });
    }

    // Calculate summary
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.reduce((sum, r) => sum + (r.count || 0), 0);
    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      message: allSuccess 
        ? `All seed operations completed successfully! Total ${totalCount} records created.`
        : `${successCount}/${results.length} seed operations completed successfully.`,
      summary: {
        totalSteps: results.length,
        successfulSteps: successCount,
        totalRecords: totalCount,
        allSuccess,
      },
      details: results,
      nextSteps: allSuccess ? [
        "Visit /programs to see the seeded programs",
        "Visit /campaigns to see the donation campaigns",
        "Check admin dashboard for management features",
      ] : [
        "Check the error details above",
        "Fix any issues and try again",
        "You can also run individual seed endpoints",
      ]
    });

  } catch (error) {
    console.error("Error running all seeds:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to run all seed operations",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const results = [];

    // Check Programs
    const programsResponse = await fetch(`${baseUrl}/api/seed/programs`);
    const programsResult = await programsResponse.json();
    results.push({
      name: "Programs",
      count: programsResult.count || 0,
      success: programsResult.success,
    });

    // Check Donation Categories
    const categoriesResponse = await fetch(`${baseUrl}/api/seed/donation-categories`);
    const categoriesResult = await categoriesResponse.json();
    results.push({
      name: "Donation Categories",
      count: categoriesResult.count || 0,
      success: categoriesResult.success,
    });

    // Check Donation Campaigns
    const campaignsResponse = await fetch(`${baseUrl}/api/seed/donation-campaigns`);
    const campaignsResult = await campaignsResponse.json();
    results.push({
      name: "Donation Campaigns",
      count: campaignsResult.count || 0,
      success: campaignsResult.success,
    });

    const totalRecords = results.reduce((sum, r) => sum + r.count, 0);

    return NextResponse.json({
      success: true,
      message: `Current seed data status: ${totalRecords} total records`,
      summary: {
        totalRecords,
        programs: results[0].count,
        donationCategories: results[1].count,
        donationCampaigns: results[2].count,
      },
      details: results,
      actions: {
        seedAll: "POST /api/seed/all - Run all seed operations",
        seedPrograms: "POST /api/seed/programs - Seed programs only",
        seedCategories: "POST /api/seed/donation-categories - Seed categories only",
        seedCampaigns: "POST /api/seed/donation-campaigns - Seed campaigns only",
      }
    });

  } catch (error) {
    console.error("Error checking seed status:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check seed status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
