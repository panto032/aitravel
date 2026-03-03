import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hotelCacheId, category, isCorrect, comment } = await request.json();

    if (!hotelCacheId || !category || typeof isCorrect !== "boolean") {
      return NextResponse.json(
        { error: "hotelCacheId, category, and isCorrect are required" },
        { status: 400 }
      );
    }

    const feedback = await prisma.aiFeedback.upsert({
      where: {
        userId_hotelCacheId_category: {
          userId: session.user.id,
          hotelCacheId,
          category,
        },
      },
      update: { isCorrect, comment },
      create: {
        userId: session.user.id,
        hotelCacheId,
        category,
        isCorrect,
        comment,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Greška pri čuvanju povratne informacije" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelCacheId = searchParams.get("hotelCacheId");

    if (!hotelCacheId) {
      return NextResponse.json(
        { error: "hotelCacheId is required" },
        { status: 400 }
      );
    }

    const feedbacks = await prisma.aiFeedback.findMany({
      where: { hotelCacheId },
    });

    // Aggregate by category
    const categories = [...new Set(feedbacks.map((f) => f.category))];
    const aggregated = categories.map((cat) => {
      const catFeedbacks = feedbacks.filter((f) => f.category === cat);
      const correct = catFeedbacks.filter((f) => f.isCorrect).length;
      const total = catFeedbacks.length;
      return {
        category: cat,
        correctCount: correct,
        totalCount: total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error("Feedback GET error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
