import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "WhatsApp notifications disabled." });
}

export async function GET() {
  return NextResponse.json({ message: "WhatsApp notifications disabled." });
}
