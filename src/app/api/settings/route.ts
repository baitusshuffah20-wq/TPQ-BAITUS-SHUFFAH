import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const isPublic = url.searchParams.get('public') === 'true';
    
    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }
    
    if (isPublic !== null) {
      where.isPublic = isPublic;
    }
    
    // Fetch settings from database
    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: {
        key: 'asc'
      }
    });

    // Transform settings into a key-value object for easier consumption
    const settingsObject = settings.reduce((acc, setting) => {
      // Parse value based on type
      let parsedValue = setting.value;
      
      if (setting.type === 'NUMBER') {
        parsedValue = parseFloat(setting.value);
      } else if (setting.type === 'BOOLEAN') {
        parsedValue = setting.value === 'true';
      } else if (setting.type === 'JSON') {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch (e) {
          console.error(`Error parsing JSON for setting ${setting.key}:`, e);
        }
      }
      
      return {
        ...acc,
        [setting.key]: {
          value: parsedValue,
          type: setting.type,
          label: setting.label,
          description: setting.description,
          isPublic: setting.isPublic
        }
      };
    }, {});

    return NextResponse.json({
      success: true,
      settings: settingsObject
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.key || !data.value || !data.type || !data.category || !data.label) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }
    
    // Check if setting already exists
    const existingSetting = await prisma.siteSetting.findUnique({
      where: {
        key: data.key
      }
    });
    
    let setting;
    
    if (existingSetting) {
      // Update existing setting
      setting = await prisma.siteSetting.update({
        where: {
          key: data.key
        },
        data: {
          value: data.value,
          type: data.type,
          category: data.category,
          label: data.label,
          description: data.description,
          isPublic: data.isPublic || false
        }
      });
    } else {
      // Create new setting
      setting = await prisma.siteSetting.create({
        data: {
          key: data.key,
          value: data.value,
          type: data.type,
          category: data.category,
          label: data.label,
          description: data.description,
          isPublic: data.isPublic || false
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save setting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}