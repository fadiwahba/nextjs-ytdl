// route.ts
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

const API_URL = process.env.YOUTUBE_DL_API_URL; // e.g., https://api.yourdomain.com
const API_KEY = process.env.YOUTUBE_DL_API_KEY;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { url, format } = body;

    const response = await fetch(`${API_URL}/download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY!,
      },
      body: JSON.stringify({ url, format }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to process download");
    }

    // Construct full URL for the download
    const downloadUrl = `${API_URL}${data.filePath}`;
    return NextResponse.json({
      filePath: downloadUrl,
      filename: data.filename,
    });
  } catch (err) {
    console.error("Error in download route:", err);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
