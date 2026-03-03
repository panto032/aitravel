import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      newUsersThisMonth,
      premiumUsers,
      totalSearches,
      searchesThisMonth,
      totalAnalyses,
      analysesThisMonth,
      apiCostThisMonth,
      apiCostLastMonth,
      cachedRequests,
      totalRequests,
      recentSearches,
      topDestinations,
      costByModel,
      totalFeedback,
      correctFeedback,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { plan: "PREMIUM" } }),
      prisma.apiUsage.count({ where: { type: "search" } }),
      prisma.apiUsage.count({
        where: { type: "search", createdAt: { gte: startOfMonth } },
      }),
      prisma.apiUsage.count({ where: { type: "analyze" } }),
      prisma.apiUsage.count({
        where: { type: "analyze", createdAt: { gte: startOfMonth } },
      }),
      prisma.apiUsage.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { costUsd: true },
      }),
      prisma.apiUsage.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
        _sum: { costUsd: true },
      }),
      prisma.apiUsage.count({ where: { cached: true } }),
      prisma.apiUsage.count(),
      prisma.searchHistory.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.searchHistory.groupBy({
        by: ["query"],
        _count: { query: true },
        orderBy: { _count: { query: "desc" } },
        take: 10,
      }),
      // Cost breakdown by model
      prisma.apiUsage.groupBy({
        by: ["model"],
        where: { createdAt: { gte: startOfMonth } },
        _sum: { costUsd: true },
        _count: true,
      }),
      // Feedback stats
      prisma.aiFeedback.count(),
      prisma.aiFeedback.count({ where: { isCorrect: true } }),
    ]);

    const cacheHitRate =
      totalRequests > 0
        ? ((cachedRequests / totalRequests) * 100).toFixed(1)
        : "0";

    // Build cost breakdown
    const breakdown = costByModel.map((item) => ({
      model: item.model,
      cost: item._sum.costUsd || 0,
      count: item._count,
    }));

    // Build feedback data
    let feedbackData = undefined;
    if (totalFeedback > 0) {
      // Get hotels with most "incorrect" votes
      const incorrectFeedback = await prisma.aiFeedback.groupBy({
        by: ["hotelCacheId", "category"],
        where: { isCorrect: false },
        _count: true,
        orderBy: { _count: { hotelCacheId: "desc" } },
        take: 5,
      });

      feedbackData = {
        totalFeedback,
        correctPercent:
          totalFeedback > 0
            ? Math.round((correctFeedback / totalFeedback) * 100)
            : 0,
        recentIncorrect: incorrectFeedback.map((f) => ({
          hotelName: f.hotelCacheId, // This would ideally be resolved to hotel name
          category: f.category,
          count: f._count,
        })),
      };
    }

    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        premium: premiumUsers,
      },
      searches: {
        total: totalSearches,
        thisMonth: searchesThisMonth,
      },
      analyses: {
        total: totalAnalyses,
        thisMonth: analysesThisMonth,
      },
      costs: {
        thisMonth: apiCostThisMonth._sum.costUsd || 0,
        lastMonth: apiCostLastMonth._sum.costUsd || 0,
        breakdown,
      },
      cache: {
        hitRate: cacheHitRate,
        cachedRequests,
        totalRequests,
      },
      recentSearches: recentSearches.map((s) => ({
        query: s.query,
        user: s.user.name || s.user.email,
        date: s.createdAt,
      })),
      topDestinations: topDestinations.map((d) => ({
        query: d.query,
        count: d._count.query,
      })),
      feedback: feedbackData,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Server error";
    const status =
      message === "Forbidden"
        ? 403
        : message === "Unauthorized"
          ? 401
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
