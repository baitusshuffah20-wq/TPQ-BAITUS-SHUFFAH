import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ApiResponse } from "@/lib/auth-middleware";
import { hasPermission } from "@/lib/permissions";

// GET /api/santri - Get santri based on user permissions
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission
    if (!hasPermission(authResult.role, 'santri:view')) {
      return ApiResponse.forbidden("Access denied to santri data");
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const halaqahId = searchParams.get("halaqahId");
    const waliId = searchParams.get("waliId");
    const search = searchParams.get("search");
    const simple = searchParams.get("simple") === "true";

    console.log("GET /api/santri - Query params:", {
      status,
      halaqahId,
      waliId,
      search,
      simple,
    });
    console.log("User role:", authResult.role, "User ID:", authResult.id);

    const where: any = {};

    // Apply role-based filtering
    if (authResult.role === 'MUSYRIF') {
      // Musyrif can only see santri in their halaqah
      const musyrifHalaqah = await prisma.halaqah.findMany({
        where: { musyrifId: authResult.id },
        select: { id: true }
      });

      const halaqahIds = musyrifHalaqah.map(h => h.id);

      if (halaqahIds.length === 0) {
        // Musyrif has no halaqah assigned
        return ApiResponse.success([], "No santri found - no halaqah assigned");
      }

      where.halaqahId = { in: halaqahIds };
      console.log("Musyrif access: filtering by halaqahIds =", halaqahIds);
    } else if (authResult.role === 'WALI') {
      // Wali can only see their own children
      where.waliId = authResult.id;
    } else if (authResult.role === 'ADMIN') {
      // Admin can see all santri, apply requested filters
      if (halaqahId) {
        where.halaqahId = halaqahId;
      }
      if (waliId) {
        where.waliId = waliId;
      }
    }

    // Apply common filters
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nis: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ];
    }

    console.log("Final where clause:", JSON.stringify(where));

    // Query santri with Prisma
    const santri = await prisma.santri.findMany({
      where,
      include: simple ? undefined : {
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        wali: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log("Found santri:", santri.length);

    return ApiResponse.success(santri, `Found ${santri.length} santri`);

  } catch (error) {
    console.error("Error in GET /api/santri:", error);
    return ApiResponse.error(
      "Failed to fetch santri data",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// POST /api/santri - Create new santri (Admin only - Musyrif cannot create)
export async function POST(request: NextRequest) {
  try {
    // Check authentication and permission
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Check permission - Only admin can create santri
    if (!hasPermission(authResult.role, 'santri:create')) {
      return ApiResponse.forbidden("Access denied to create santri. Only admin can add new santri.");
    }

    const body = await request.json();
    const {
      nis,
      name,
      gender,
      birthDate,
      birthPlace,
      address,
      phone,
      email,
      photo,
      halaqahId,
      waliId,
      status = 'ACTIVE',
      enrollmentDate
    } = body;

    // Validation
    if (!name || !gender) {
      return ApiResponse.error("Name and gender are required");
    }

    // For musyrif, validate they can only add santri to their own halaqah
    if (authResult.role === 'MUSYRIF' && halaqahId) {
      const halaqah = await prisma.halaqah.findUnique({
        where: { id: halaqahId }
      });

      if (!halaqah || halaqah.musyrifId !== authResult.id) {
        return ApiResponse.forbidden("You can only add santri to your own halaqah");
      }
    }

    // Check if NIS already exists
    if (nis) {
      const existingSantri = await prisma.santri.findUnique({
        where: { nis }
      });

      if (existingSantri) {
        return ApiResponse.error("NIS already exists");
      }
    }

    // Create santri
    const santri = await prisma.santri.create({
      data: {
        nis,
        name,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthPlace,
        address,
        phone,
        email,
        photo,
        halaqahId,
        waliId,
        status,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date()
      },
      include: {
        halaqah: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        wali: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log("Created santri:", santri.id);
    return ApiResponse.success(santri, "Santri created successfully");

  } catch (error) {
    console.error("Error in POST /api/santri:", error);
    return ApiResponse.error(
      "Failed to create santri",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}


