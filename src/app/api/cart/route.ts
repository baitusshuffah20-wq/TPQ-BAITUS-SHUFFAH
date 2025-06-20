import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/cart-service';

// GET /api/cart - Get cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { success: false, message: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const cartSummary = await CartService.getCartSummary(cartId);

    return NextResponse.json({
      success: true,
      data: cartSummary
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartId,
      userId,
      itemType,
      itemId,
      name,
      description,
      price,
      quantity = 1,
      metadata
    } = body;

    // Validation
    if (!cartId || !itemType || !itemId || !name || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'Cart ID, item type, item ID, name, and price are required' },
        { status: 400 }
      );
    }

    const cartItem = await CartService.addToCart(cartId, {
      userId,
      itemType,
      itemId,
      name,
      description,
      price,
      quantity,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to add item to cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, itemId, quantity } = body;

    if (!cartId || !itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, message: 'Cart ID, item ID, and quantity are required' },
        { status: 400 }
      );
    }

    const updatedItem = await CartService.updateQuantity(cartId, itemId, quantity);

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update cart item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('cartId');
    const itemId = searchParams.get('itemId');
    const action = searchParams.get('action'); // 'clear' to clear entire cart

    if (!cartId) {
      return NextResponse.json(
        { success: false, message: 'Cart ID is required' },
        { status: 400 }
      );
    }

    if (action === 'clear') {
      await CartService.clearCart(cartId);
      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } else if (itemId) {
      await CartService.removeFromCart(cartId, itemId);
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Item ID is required to remove specific item' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to remove from cart',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
