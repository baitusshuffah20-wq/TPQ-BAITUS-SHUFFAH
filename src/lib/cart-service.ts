// Temporary implementation without database
// import { prisma } from "@/lib/prisma";

// Cart Item Types
export const CartItemType = {
  SPP: "SPP",
  DONATION: "DONATION",
  PRODUCT: "PRODUCT",
  SERVICE: "SERVICE",
  EVENT: "EVENT",
  BOOK: "BOOK",
} as const;

interface CartItem {
  id?: string;
  cartId: string;
  userId?: string;
  itemType: string;
  itemId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  metadata?: Record<string, any>;
}

interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  itemCount: number;
}

// Temporary in-memory storage for cart items
const cartStorage = new Map<string, CartItem[]>();

export class CartService {
  // Add item to cart
  static async addToCart(
    cartId: string,
    item: Omit<CartItem, "id" | "cartId">,
  ): Promise<CartItem> {
    try {
      const cartItems = cartStorage.get(cartId) || [];

      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (cartItem) =>
          cartItem.itemType === item.itemType &&
          cartItem.itemId === item.itemId,
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += item.quantity;
        cartItems[existingItemIndex].price = item.price; // Update price in case it changed

        cartStorage.set(cartId, cartItems);
        return cartItems[existingItemIndex];
      } else {
        // Create new cart item
        const newItem: CartItem = {
          id: `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          cartId,
          userId: item.userId,
          itemType: item.itemType,
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          metadata: item.metadata,
        };

        cartItems.push(newItem);
        cartStorage.set(cartId, cartItems);
        return newItem;
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }
  }

  // Remove item from cart
  static async removeFromCart(
    cartId: string,
    itemId: string,
  ): Promise<boolean> {
    try {
      const cartItems = cartStorage.get(cartId) || [];
      const filteredItems = cartItems.filter((item) => item.id !== itemId);
      cartStorage.set(cartId, filteredItems);
      return true;
    } catch (error) {
      console.error("Error removing item from cart:", error);
      throw error;
    }
  }

  // Update item quantity
  static async updateQuantity(
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<CartItem | null> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(cartId, itemId);
        return null;
      }

      const cartItems = cartStorage.get(cartId) || [];
      const itemIndex = cartItems.findIndex((item) => item.id === itemId);

      if (itemIndex !== -1) {
        cartItems[itemIndex].quantity = quantity;
        cartStorage.set(cartId, cartItems);
        return cartItems[itemIndex];
      }

      return null;
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      throw error;
    }
  }

  // Get cart items
  static async getCartItems(cartId: string): Promise<CartItem[]> {
    try {
      return cartStorage.get(cartId) || [];
    } catch (error) {
      console.error("Error getting cart items:", error);
      throw error;
    }
  }

  // Get cart summary
  static async getCartSummary(cartId: string): Promise<CartSummary> {
    try {
      const items = await this.getCartItems(cartId);

      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const tax = this.calculateTax(subtotal);
      const discount = await this.calculateDiscount(cartId, subtotal);
      const total = subtotal + tax - discount;
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items,
        subtotal,
        tax,
        discount,
        total,
        itemCount,
      };
    } catch (error) {
      console.error("Error getting cart summary:", error);
      throw error;
    }
  }

  // Clear cart
  static async clearCart(cartId: string): Promise<boolean> {
    try {
      cartStorage.set(cartId, []);
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  // Merge guest cart with user cart
  static async mergeCart(
    guestCartId: string,
    userCartId: string,
  ): Promise<boolean> {
    try {
      const guestItems = cartStorage.get(guestCartId) || [];
      const userItems = cartStorage.get(userCartId) || [];

      for (const guestItem of guestItems) {
        // Check if item exists in user cart
        const existingUserItemIndex = userItems.findIndex(
          (item) =>
            item.itemType === guestItem.itemType &&
            item.itemId === guestItem.itemId,
        );

        if (existingUserItemIndex !== -1) {
          // Update quantity
          userItems[existingUserItemIndex].quantity += guestItem.quantity;
        } else {
          // Move item to user cart
          userItems.push({
            ...guestItem,
            cartId: userCartId,
          });
        }
      }

      // Update user cart and clear guest cart
      cartStorage.set(userCartId, userItems);
      cartStorage.set(guestCartId, []);

      return true;
    } catch (error) {
      console.error("Error merging carts:", error);
      throw error;
    }
  }

  // Add SPP payment to cart (temporarily disabled - requires database)
  static async addSPPToCart(
    cartId: string,
    studentId: string,
    userId?: string,
  ): Promise<CartItem> {
    try {
      // Temporary implementation without database
      const mockSPPItem: CartItem = {
        id: `spp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cartId,
        userId,
        itemType: "SPP",
        itemId: studentId,
        name: `SPP Payment - Student ${studentId}`,
        description: "Monthly SPP payment",
        price: 150000, // Default SPP amount
        quantity: 1,
        metadata: {
          studentId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      };

      const cartItems = cartStorage.get(cartId) || [];
      cartItems.push(mockSPPItem);
      cartStorage.set(cartId, cartItems);

      return mockSPPItem;

      /* Original database implementation - commented out
      // Get student info
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, name: true },
      });

      // Get santri info for NIS
      const santri = await prisma.santri.findFirst({
        where: { waliId: studentId },
        select: { nis: true },
      });

      if (!student) {
        throw new Error("Student not found");
      }
      */
    } catch (error) {
      console.error("Error adding SPP to cart:", error);
      throw error;
    }
  }

  // Add donation to cart
  static async addDonationToCart(
    cartId: string,
    donationType: string,
    amount: number,
    message?: string,
    userId?: string,
  ): Promise<CartItem> {
    try {
      // Temporary implementation without database
      const donationCategories: Record<string, string> = {
        pembangunan: "Donasi Pembangunan",
        operasional: "Donasi Operasional",
        beasiswa: "Donasi Beasiswa",
        umum: "Donasi Umum",
      };

      const donationName = donationCategories[donationType] || "Donasi Umum";

      const mockDonationItem: CartItem = {
        id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cartId,
        userId,
        itemType: "DONATION",
        itemId: donationType,
        name: donationName,
        description: message || `Donasi untuk ${donationName.toLowerCase()}`,
        price: amount,
        quantity: 1,
        metadata: {
          donationType,
          message,
          isAnonymous: false,
        },
      };

      const cartItems = cartStorage.get(cartId) || [];
      cartItems.push(mockDonationItem);
      cartStorage.set(cartId, cartItems);

      return mockDonationItem;

      /* Original database implementation - commented out
      // Try to get donation category from DonationCategory table first
      let donationName = "Donasi";
      let categoryData = null;

      try {
        // First, try to get from the DonationCategory model
        const category = await prisma.donationCategory.findFirst({
          where: {
            OR: [{ id: donationType }, { slug: donationType }],
            isActive: true,
          },
        });

        if (category) {
          categoryData = category;
          donationName = category.title;
          console.log("Found donation category in DB:", category.title);
        } else {
          console.log("Donation category not found in DB, trying SiteSettings");

          // If not found, try SiteSettings as a fallback
          const setting = await prisma.siteSetting.findUnique({
            where: { key: "donation_categories" },
          });

          if (setting) {
            const categories = JSON.parse(setting.value);
            // ... rest of database implementation
          }
        }
      } catch (err) {
        console.error("Error fetching donation category:", err);
      }
      */
    } catch (error) {
      console.error("Error adding donation to cart:", error);
      throw error;
    }
  }

  // Helper methods
  private static calculateTax(subtotal: number): number {
    // No tax for now
    return 0;
  }

  private static async calculateDiscount(
    cartId: string,
    subtotal: number,
  ): Promise<number> {
    // No discount for now
    return 0;
  }

  // Get available payment items for a user (temporarily disabled)
  static async getAvailableItems(userId: string): Promise<any[]> {
    // Temporary implementation - return empty array
    return [];

    /* Original database implementation - commented out
    try {
      const items: Array<{
        type: string;
        id: string;
        name: string;
        description: string;
        price: number;
        category: string;
        metadata?: Record<string, any>;
        isCustomAmount?: boolean;
      }> = [];

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return items;

      // Get children if user is a parent
      let students: Array<{ id: string; name: string; nis?: string }> = [];
    */
  }

  /* All database-dependent methods commented out for now
  static async getAvailableItemsOriginal(userId: string): Promise<any[]> {
    try {
      if (user.role === "WALI") {
        // Get children for parents
        const santriChildren = await prisma.santri.findMany({
          where: { waliId: userId },
          select: {
            id: true,
            name: true,
            nis: true,
          },
        });

        students = santriChildren.map((child) => ({
          id: child.id,
          name: child.name,
          nis: child.nis,
        }));
      } else {
        // For students, use their own info
        const santri = await prisma.santri.findFirst({
          where: { waliId: userId },
          select: { nis: true },
        });

        students = [
          {
            id: user.id,
            name: user.name,
            nis: santri?.nis,
          },
        ];
      }
      for (const student of students) {
        const sppAmount = await this.getSPPAmount(student.id);
        const currentMonth = new Date().toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });

        items.push({
          type: CartItemType.SPP,
          id: student.id,
          name: `SPP ${student.name} - ${currentMonth}`,
          description: `Pembayaran SPP bulanan`,
          price: sppAmount,
          category: "SPP",
          metadata: {
            studentId: student.id,
            studentName: student.name,
            period: currentMonth,
          },
        });
      }

      // Add donation options
      const donationOptions = [
        {
          type: "general",
          name: "Donasi Umum",
          description: "Donasi untuk kebutuhan umum TPQ",
        },
        {
          type: "building",
          name: "Donasi Pembangunan",
          description: "Donasi untuk pembangunan fasilitas",
        },
        {
          type: "scholarship",
          name: "Donasi Beasiswa",
          description: "Donasi untuk beasiswa santri",
        },
        {
          type: "equipment",
          name: "Donasi Peralatan",
          description: "Donasi untuk peralatan belajar",
        },
        {
          type: "books",
          name: "Donasi Buku",
          description: "Donasi untuk perpustakaan",
        },
      ];

      for (const donation of donationOptions) {
        items.push({
          type: CartItemType.DONATION,
          id: donation.type,
          name: donation.name,
          description: donation.description,
          price: 0, // Custom amount
          category: "Donasi",
          isCustomAmount: true,
          metadata: {
            donationType: donation.type,
          },
        });
      }

      return items;
    } catch (error) {
      console.error("Error getting available items:", error);
      throw error;
    }
  }
  */

  // Helper methods (commented out - not needed for in-memory implementation)
  /*
  private static formatCartItem(item: any): CartItem {
    return {
      id: item.id,
      cartId: item.cartId,
      userId: item.userId,
      itemType: item.itemType,
      itemId: item.itemId,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      metadata: item.metadata ? JSON.parse(item.metadata) : undefined,
    };
  }

  private static async getSPPAmount(studentId: string): Promise<number> {
    // This should get the actual SPP amount from settings or student record
    // For now, return a default amount
    return 150000; // Rp 150,000
  }

  private static calculateTax(subtotal: number): number {
    // Calculate tax if applicable (e.g., 0% for education)
    return 0;
  }

  private static async calculateDiscount(
    cartId: string,
    subtotal: number,
  ): Promise<number> {
    // Calculate any applicable discounts
    // This could check for promo codes, student discounts, etc.
    return 0;
  }
  */

  // Generate cart ID for guest users
  static generateCartId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get cart ID for user (create if doesn't exist)
  static async getOrCreateUserCartId(userId: string): Promise<string> {
    // For simplicity, we'll use userId as cartId for logged-in users
    // In a more complex system, you might want separate cart sessions
    return `user_cart_${userId}`;
  }
}
