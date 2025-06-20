import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit-log';

// Schema for news validation
const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
  isPublished: z.boolean().default(true),
  publishDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

// GET handler - Get a specific news
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const news = await prisma.news.findUnique({
      where: { id }
    });

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// PUT handler - Update news
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    const data = await req.json();

    // Validate news data
    const validationResult = newsSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Get existing news for audit log
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Update news in database
    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished,
        publishDate: data.publishDate ? new Date(data.publishDate) : undefined,
        tags: data.tags,
        category: data.category,
        updatedAt: new Date(),
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      entity: 'NEWS',
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(existingNews),
      newData: JSON.stringify(updatedNews)
    });

    return NextResponse.json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete news
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    // Check if news exists
    const news = await prisma.news.findUnique({
      where: { id }
    });

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 });
    }

    // Delete news from database
    await prisma.news.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog({
      action: 'DELETE',
      entity: 'NEWS',
      entityId: id,
      userId: session.user.id,
      oldData: JSON.stringify(news),
      newData: ""
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete news',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}