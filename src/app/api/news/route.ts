import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit-log';
import { z } from 'zod';

// Schema for news validation
const newsSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  excerpt: z.string().min(1, "Ringkasan wajib diisi"),
  content: z.string().min(1, "Konten wajib diisi"),
  image: z.string().optional(),
  category: z.string().min(1, "Kategori wajib diisi"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const featured = url.searchParams.get('featured') === 'true';
    const status = url.searchParams.get('status');
    
    // Build where clause
    const where: any = {};
    
    // If admin is viewing, show all statuses, otherwise only published
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN';
    
    if (!isAdmin && !status) {
      where.status = 'PUBLISHED';
    } else if (status && status !== 'ALL') {
      where.status = status;
    }
    
    if (category && category !== 'Semua' && category !== 'ALL') {
      where.category = category;
    }
    
    if (featured) {
      where.featured = true;
    }
    
    // Fetch news from database
    const news = await prisma.news.findMany({
      where,
      orderBy: {
        publishedAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      news
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST handler - Create a new news item
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'MUSYRIF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Validate news data
    const validationResult = newsSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed', 
          details: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    // Create news in database
    const news = await prisma.news.create({
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        author: session.user.name || 'Admin',
        publishedAt: new Date(),
        category: data.category,
        status: data.status,
        featured: data.featured,
        views: 0
      },
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      entity: 'NEWS',
      entityId: news.id,
      userId: session.user.id,
      newData: JSON.stringify(news),
    });

    return NextResponse.json({
      success: true,
      news
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}