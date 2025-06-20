import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db-test';

export async function GET() {
  try {
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({ 
        status: 'success', 
        message: result.message,
        database: result.dbInfo
      });
    } else {
      return NextResponse.json(
        { status: 'error', message: result.message, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json(
      { status: 'error', message: 'Error testing database connection', error },
      { status: 500 }
    );
  }
}