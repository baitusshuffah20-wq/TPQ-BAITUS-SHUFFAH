import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', file ? {
      name: file.name,
      type: file.type,
      size: file.size
    } : 'No file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Define the public directory path
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    const filePath = path.join(uploadsDir, fileName);
    
    // Ensure the uploads directory exists
    try {
      // Check if uploads directory exists, if not create it
      if (!fs.existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }
      
      // Write the file
      await writeFile(filePath, buffer);
      
      // Return the file URL
      const fileUrl = `/uploads/${fileName}`;
      
      console.log('File saved successfully at:', filePath);
      console.log('File URL:', fileUrl);
      
      return NextResponse.json({
        success: true,
        fileUrl,
        fileName: file.name,
        size: file.size,
        type: file.type
      });
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save file: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}