import { NextResponse } from "next/server";

// UI-only mode: presigned uploads from mocks/handlers point here. Accepts and
// discards the file.
export async function POST() {
  return new NextResponse(null, { status: 204 });
}

export async function PUT() {
  return new NextResponse(null, { status: 204 });
}
