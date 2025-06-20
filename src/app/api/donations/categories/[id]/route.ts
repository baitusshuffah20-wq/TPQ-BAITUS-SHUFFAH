import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get donation categories from SiteSettings
async function getDonationCategories() {
  try {
    // Try to get categories from SiteSettings
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'donation_categories' }
    });

    if (setting) {
      return JSON.parse(setting.value);
    }
    
    // If no categories found in SiteSettings, return empty array
    return [];
  } catch (error) {
    console.error('Error getting donation categories:', error);
    return [];
  }
}

// Save donation categories to SiteSettings
async function saveDonationCategories(categories: any[]) {
  await prisma.siteSetting.upsert({
    where: { key: 'donation_categories' },
    update: { value: JSON.stringify(categories) },
    create: {
      key: 'donation_categories',
      value: JSON.stringify(categories),
      type: 'json',
      category: 'donations',
      label: 'Donation Categories',
      isPublic: true
    }
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get all categories
    const categories = await getDonationCategories();
    
    // Find the requested category
    const category = categories.find((cat: any) => cat.id === id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Donation category not found' },
        { status: 404 }
      );
    }

    // Get completed donations for this category
    const donations = await prisma.donation.findMany({
      where: { 
        status: 'COMPLETED',
        type: id.toUpperCase() // Using type field as fallback
      },
      select: {
        amount: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        donations
      }
    });
  } catch (error) {
    console.error('Error fetching donation category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch donation category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Get all categories
    const categories = await getDonationCategories();
    
    // Find the index of the category to update
    const categoryIndex = categories.findIndex((cat: any) => cat.id === id);

    if (categoryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Donation category not found' },
        { status: 404 }
      );
    }
    
    // Update the category
    const updatedCategory = {
      ...categories[categoryIndex],
      title: data.title !== undefined ? data.title : categories[categoryIndex].title,
      description: data.description !== undefined ? data.description : categories[categoryIndex].description,
      target: data.target !== undefined ? data.target : categories[categoryIndex].target,
      collected: data.collected !== undefined ? data.collected : categories[categoryIndex].collected,
      icon: data.icon !== undefined ? data.icon : categories[categoryIndex].icon,
      color: data.color !== undefined ? data.color : categories[categoryIndex].color,
      bgColor: data.bgColor !== undefined ? data.bgColor : categories[categoryIndex].bgColor,
      urgent: data.urgent !== undefined ? data.urgent : categories[categoryIndex].urgent,
      isActive: data.isActive !== undefined ? data.isActive : categories[categoryIndex].isActive,
      order: data.order !== undefined ? data.order : categories[categoryIndex].order
    };
    
    // Replace the category in the array
    categories[categoryIndex] = updatedCategory;
    
    // Save the updated categories
    await saveDonationCategories(categories);
    
    return NextResponse.json({
      success: true,
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating donation category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update donation category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get all categories
    const categories = await getDonationCategories();
    
    // Find the index of the category to delete
    const categoryIndex = categories.findIndex((cat: any) => cat.id === id);

    if (categoryIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Donation category not found' },
        { status: 404 }
      );
    }
    
    // Remove the category from the array
    categories.splice(categoryIndex, 1);
    
    // Save the updated categories
    await saveDonationCategories(categories);
    
    return NextResponse.json({
      success: true,
      message: 'Donation category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting donation category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete donation category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}