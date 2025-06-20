import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'admin123',
  database: 'tpq_baitus_shuffah_new'
};

export async function GET(request: NextRequest) {
  let connection: mysql.Connection | null = null;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    // Ensure connection is not null
    if (!connection) {
      throw new Error('Failed to create database connection');
    }
    
    // Get tables
    const [tables] = await connection.execute(`SHOW TABLES`);
    
    // Get hafalan_progress table structure
    let hafalanProgressStructure = null;
    try {
      const [structure] = await connection.execute(`DESCRIBE hafalan_progress`);
      hafalanProgressStructure = structure;
    } catch (error) {
      console.error('Error getting hafalan_progress structure:', error);
    }
    
    return NextResponse.json({
      success: true,
      tables,
      hafalanProgressStructure
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Gagal memeriksa database',
        error: String(error)
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
