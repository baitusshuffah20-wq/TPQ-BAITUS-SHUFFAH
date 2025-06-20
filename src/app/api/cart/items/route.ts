import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/cart-service';

// GET /api/cart/items - Get available items for cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category'); // 'spp', 'donation', 'all'

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const availableItems = await CartService.getAvailableItems(userId);
    
    // Filter by category if specified
    const filteredItems = category && category !== 'all' 
      ? availableItems.filter(item => item.category.toLowerCase() === category.toLowerCase())
      : availableItems;

    return NextResponse.json({
      success: true,
      data: {
        items: filteredItems,
        categories: ['SPP', 'Donasi']
      }
    });
  } catch (error) {
    console.error('Error getting available items:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get available items',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/cart/items/spp - Add SPP to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, studentId, userId } = body;

    if (!cartId || !studentId) {
      return NextResponse.json(
        { success: false, message: 'Cart ID and Student ID are required' },
        { status: 400 }
      );
    }

    const cartItem = await CartService.addSPPToCart(cartId, studentId, userId);

    return NextResponse.json({
      success: true,
      message: 'SPP added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    console.error('Error adding SPP to cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add SPP to cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
