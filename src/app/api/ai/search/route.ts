import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchDestination } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await request.json();
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Unesite pojam za pretragu" },
        { status: 400 }
      );
    }

    const results = await searchDestination(query.trim(), session.user.id);
    return NextResponse.json(results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Doslo je do greske pri pretrazi";

    // Rate limit error
    if (message.includes("mesecni limit")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }

    console.error("Search error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
