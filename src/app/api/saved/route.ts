import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - list saved analyses
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const saved = await prisma.savedAnalysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Get saved error:", error);
    return NextResponse.json(
      { error: "Greska pri ucitavanju" },
      { status: 500 }
    );
  }
}

// POST - save analysis
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hotelName, location, aiScore, analysis } = await request.json();

    const saved = await prisma.savedAnalysis.create({
      data: {
        userId: session.user.id,
        hotelName,
        location,
        aiScore,
        analysis,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json(
      { error: "Greska pri cuvanju" },
      { status: 500 }
    );
  }
}

// DELETE - remove saved analysis
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    await prisma.savedAnalysis.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Greska pri brisanju" },
      { status: 500 }
    );
  }
}
