import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoRef: string }> }
) {
  const { photoRef } = await params;
  const ref = decodeURIComponent(photoRef);
  const maxWidth = request.nextUrl.searchParams.get("maxWidth") || "800";

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Google Places API not configured" },
      { status: 503 }
    );
  }

  try {
    const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
    const res = await fetch(url, { redirect: "follow" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    const imageBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable", // 7 days
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}
