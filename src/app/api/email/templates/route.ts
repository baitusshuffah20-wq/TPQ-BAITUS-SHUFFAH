import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { prisma } from '@/lib/prisma';

// GET /api/email/templates - Get all email templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.emailTemplate.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        templates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch email templates',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/email/templates - Create new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      subject,
      html,
      text,
      variables,
      description,
      category,
      createdBy
    } = body;

    // Validation
    if (!name || !subject || !html || !createdBy) {
      return NextResponse.json(
        { success: false, message: 'Name, subject, HTML content, and creator are required' },
        { status: 400 }
      );
    }

    // Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name }
    });

    if (existingTemplate) {
      return NextResponse.json(
        { success: false, message: 'Template with this name already exists' },
        { status: 400 }
      );
    }

    const emailService = new EmailService();
    const template = await emailService.createTemplate({
      name,
      subject,
      html,
      text,
      variables,
      description,
      category,
      createdBy
    });

    return NextResponse.json({
      success: true,
      message: 'Email template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create email template',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/email/templates - Update email template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      subject,
      html,
      text,
      variables,
      description,
      category,
      isActive
    } = body;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing template
    if (name && name !== existingTemplate.name) {
      const nameConflict = await prisma.emailTemplate.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return NextResponse.json(
          { success: false, message: 'Template with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(html && { html }),
        ...(text !== undefined && { text }),
        ...(variables && { variables: JSON.stringify(variables) }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email template updated successfully',
      data: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update email template',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/email/templates - Delete email template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { success: false, message: 'Template not found' },
        { status: 404 }
      );
    }

    await prisma.emailTemplate.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete email template',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
