import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            searchHistory: true,
            savedAnalyses: true,
            apiUsage: true,
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();

    const { userId, role, plan, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId je obavezan" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (role !== undefined) data.role = role;
    if (plan !== undefined) data.plan = plan;
    if (isActive !== undefined) data.isActive = isActive;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        isActive: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Forbidden" ? 403 : message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
