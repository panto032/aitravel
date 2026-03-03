import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeHotel } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hotelName, location, googlePlaceId, forceRefresh } = await request.json();
    if (!hotelName || !location) {
      return NextResponse.json(
        { error: "Naziv hotela i lokacija su obavezni" },
        { status: 400 }
      );
    }

    const analysis = await analyzeHotel(
      hotelName,
      location,
      session.user.id,
      googlePlaceId,
      !!forceRefresh
    );
    return NextResponse.json(analysis);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Doslo je do greske pri analizi";

    if (message.includes("mesecni limit") || message.includes("Dnevni limit")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    console.error("Analysis error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
