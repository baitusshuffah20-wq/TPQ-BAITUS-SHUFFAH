import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch approved and featured testimonials
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isApproved: true
      },
      include: {
        wali: {
          select: {
            name: true
          }
        },
        santri: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include proper names
    const formattedTestimonials = testimonials.map(testimonial => {
      return {
        id: testimonial.id,
        content: testimonial.content,
        rating: testimonial.rating,
        authorName: testimonial.authorName || 
                   (testimonial.wali?.name || 
                   testimonial.santri?.name || 
                   'Anonymous'),
        authorRole: testimonial.authorRole,
        isFeatured: testimonial.isFeatured,
        createdAt: testimonial.createdAt
      };
    });

    return NextResponse.json({
      success: true,
      testimonials: formattedTestimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch testimonials',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}