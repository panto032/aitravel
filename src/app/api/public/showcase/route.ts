import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const revalidate = 3600; // ISR: revalidate every 1 hour

export async function GET() {
  try {
    // Get top hotels that have been analyzed (aiScore is set when analysis is done)
    const hotels = await prisma.hotelCache.findMany({
      where: {
        aiScore: { not: null },
      },
      orderBy: { googleReviewCount: { sort: "desc", nulls: "last" } },
      take: 6,
      select: {
        id: true,
        name: true,
        location: true,
        aiScore: true,
        googleRating: true,
        googleReviewCount: true,
        googlePhotos: true,
        aiAnalysis: true,
        googlePlaceId: true,
      },
    });

    // Aggregate statistics
    const [totalReviews, totalHotels, totalLocations] = await Promise.all([
      prisma.hotelCache.aggregate({
        _sum: { googleReviewCount: true },
      }),
      prisma.hotelCache.count({
        where: { aiScore: { not: null } },
      }),
      prisma.hotelCache.findMany({
        where: { aiScore: { not: null } },
        select: { location: true },
        distinct: ["location"],
      }),
    ]);

    const showcase = hotels.map((h) => {
      const analysis = h.aiAnalysis as Record<string, unknown> | null;
      const photos = (h.googlePhotos as string[]) || [];
      return {
        id: h.id,
        name: h.name,
        location: h.location,
        aiScore: h.aiScore,
        googleRating: h.googleRating,
        googleReviewCount: h.googleReviewCount,
        photoUrl: photos[0] || null,
        googlePlaceId: h.googlePlaceId,
        summary: analysis?.summary || null,
        pros: ((analysis?.pros as string[]) || []).slice(0, 2),
        cons: ((analysis?.cons as string[]) || []).slice(0, 2),
        topScores: (
          (analysis?.scores as { category: string; score: number }[]) || []
        )
          .sort((a, b) => b.score - a.score)
          .slice(0, 3),
      };
    });

    return NextResponse.json(
      {
        hotels: showcase,
        stats: {
          totalReviews: totalReviews._sum.googleReviewCount || 0,
          totalHotels,
          totalLocations: totalLocations.length,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Showcase error:", error);
    return NextResponse.json(
      {
        hotels: [],
        stats: { totalReviews: 0, totalHotels: 0, totalLocations: 0 },
      },
      { status: 200 }
    );
  }
}
