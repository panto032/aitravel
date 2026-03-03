import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [user, searchCount, analysisCount, savedCount, apiUsageMonth] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            plan: true,
            createdAt: true,
          },
        }),
        prisma.searchHistory.count({
          where: { userId: session.user.id },
        }),
        prisma.apiUsage.count({
          where: { userId: session.user.id, type: "analyze" },
        }),
        prisma.savedAnalysis.count({
          where: { userId: session.user.id },
        }),
        prisma.apiUsage.count({
          where: {
            userId: session.user.id,
            cached: false,
            createdAt: { gte: startOfMonth },
          },
        }),
      ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      stats: {
        totalSearches: searchCount,
        totalAnalyses: analysisCount,
        savedAnalyses: savedCount,
        monthlyUsage: apiUsageMonth,
        monthlyLimit: user.plan === "PREMIUM" ? -1 : 10,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();
    const updateData: { name?: string; email?: string } = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      // Check if email is taken
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email je već u upotrebi" },
          { status: 409 }
        );
      }
      updateData.email = email;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
