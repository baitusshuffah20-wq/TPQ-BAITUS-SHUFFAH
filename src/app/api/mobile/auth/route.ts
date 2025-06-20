import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, deviceId, deviceType, fcmToken } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        santriAsWali: {
          include: {
            halaqah: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    // Update device info (for push notifications)
    if (deviceId && fcmToken) {
      // In a real app, you'd store device info in a separate table
      console.log('Device registered:', { deviceId, deviceType, fcmToken });
    }

    // Prepare user data for mobile
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      children: user.santriAsWali.map(santri => ({
        id: santri.id,
        name: santri.name,
        nis: santri.nis,
        halaqah: santri.halaqah?.name,
        status: santri.status
      }))
    };

    return NextResponse.json({
      success: true,
      token,
      user: userData,
      expiresIn: 30 * 24 * 60 * 60 // 30 days in seconds
    });

  } catch (error) {
    console.error('Mobile auth error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Refresh token endpoint
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId, 
          email: decoded.email, 
          role: decoded.role 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return NextResponse.json({
        success: true,
        token: newToken,
        expiresIn: 30 * 24 * 60 * 60
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
