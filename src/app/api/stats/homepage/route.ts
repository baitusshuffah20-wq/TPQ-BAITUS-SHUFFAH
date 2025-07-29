import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Homepage stats API called");

    // Get real data from database
    const totalSantri = await prisma.santri.count({
      where: { status: "ACTIVE" },
    });

    // Count santri with completed hafalan (as a proxy for hafidz/hafidzah)
    const totalHafidz = await prisma.santri.count({
      where: {
        hafalan: {
          some: {
            status: "APPROVED",
          },
        },
      },
    });

    // Get total donations - use raw SQL to avoid Prisma model issues
    let totalDonations = 0;
    try {
      const donations = await prisma.$queryRaw`
        SELECT SUM(amount) as total FROM donations WHERE status = 'CONFIRMED'
      `;

      // Safely handle the result
      if (donations && Array.isArray(donations) && donations.length > 0) {
        const result = donations[0] as { total: number | null };
        totalDonations = result.total || 0;
      }
    } catch (error) {
      console.error("Error getting donation total:", error);
      // Fallback to zero if there's an error
    }

    // Get total programs
    const totalPrograms = await prisma.program.count();

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendanceToday = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: "PRESENT",
      },
    });

    // Prepare base stats from real data
    const baseStats = {
      totalSantri,
      totalHafidz: totalHafidz || 0,
      totalDonations,
      totalPrograms,
      attendanceToday,
    };

    // Calculate years of experience (since establishment)
    const establishmentYear = 2009;
    const currentYear = new Date().getFullYear();
    const yearsOfExperience = currentYear - establishmentYear;

    // Convert donation amount to millions
    const donationInMillions = Math.round(baseStats.totalDonations / 1000000);

    // Calculate success rate based on real data
    const successRate =
      baseStats.totalSantri > 0
        ? Math.round((baseStats.totalHafidz / baseStats.totalSantri) * 100)
        : 0;

    const stats = [
      {
        id: "santri",
        label: "Santri Aktif",
        value: baseStats.totalSantri,
        suffix: "+",
        icon: "Users",
        color: "text-teal-600",
        description: "Santri yang sedang menghafal Al-Quran",
      },
      {
        id: "hafidz",
        label: "Hafidz/Hafidzah",
        value: baseStats.totalHafidz,
        suffix: "+",
        icon: "GraduationCap",
        color: "text-yellow-600",
        description: "Lulusan yang telah menyelesaikan 30 Juz",
      },
      {
        id: "experience",
        label: "Tahun Berpengalaman",
        value: yearsOfExperience,
        suffix: "",
        icon: "Award",
        color: "text-green-600",
        description: "Pengalaman dalam pendidikan tahfidz",
      },
      {
        id: "donations",
        label: "Total Donasi",
        value: donationInMillions,
        suffix: "Jt+",
        icon: "Heart",
        color: "text-red-600",
        description: "Dana yang terkumpul untuk operasional",
      },
      {
        id: "programs",
        label: "Program Aktif",
        value: baseStats.totalPrograms,
        suffix: "",
        icon: "BookOpen",
        color: "text-blue-600",
        description: "Program pembelajaran yang tersedia",
      },
      {
        id: "success",
        label: "Tingkat Keberhasilan",
        value: successRate,
        suffix: "%",
        icon: "TrendingUp",
        color: "text-purple-600",
        description: "Santri yang berhasil menyelesaikan target",
      },
    ];

    // Additional operational info
    const operationalInfo = {
      hours: {
        weekdays: "07:00 - 17:00",
        saturday: "07:00 - 15:00",
        sunday: "08:00 - 12:00",
      },
      location: {
        address: "Jl. Islamic Center No. 123, Jakarta Pusat",
        description:
          "Berlokasi di pusat kota dengan akses mudah menggunakan transportasi umum",
      },
      todayActivity: {
        attendance: baseStats.attendanceToday,
        description: `${baseStats.attendanceToday} santri hadir hari ini`,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        operationalInfo,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching homepage stats:", error);

    return new NextResponse(
      JSON.stringify({ success: false, message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
