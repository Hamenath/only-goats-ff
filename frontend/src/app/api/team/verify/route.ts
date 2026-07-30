import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// Simple in-memory rate limiting map (IP -> failed attempts & window)
const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    return false;
  }

  if (now > entry.resetTime) {
    rateLimitMap.delete(ip);
    return false;
  }

  return entry.attempts >= 5;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { attempts: 1, resetTime: now + 15 * 60 * 1000 }); // 15 min window
  } else {
    entry.attempts += 1;
  }
}

function cleanPhone(p: string): string {
  return p.replace(/\D/g, "");
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local_client";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { squadId, phone } = body || {};

    if (!squadId || !phone) {
      return NextResponse.json(
        { error: "Invalid Squad ID or Captain Phone Number." },
        { status: 400 }
      );
    }

    const formattedSquadId = String(squadId).trim();
    const formattedPhone = cleanPhone(String(phone));

    // Query Firestore registrations by Squad ID
    const q = query(
      collection(db, "registrations"),
      where("teamId", "==", formattedSquadId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid Squad ID or Captain Phone Number." },
        { status: 401 }
      );
    }

    const docSnap = snap.docs[0];
    const teamData = docSnap.data();

    // Verify phone number match
    const registeredPhoneClean = cleanPhone(String(teamData.phone || ""));

    if (!registeredPhoneClean || registeredPhoneClean !== formattedPhone) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Invalid Squad ID or Captain Phone Number." },
        { status: 401 }
      );
    }

    // Success! Return authenticated team data
    return NextResponse.json({
      success: true,
      team: {
        id: docSnap.id,
        teamId: teamData.teamId,
        teamName: teamData.teamName,
        captain: teamData.captain,
        players: teamData.players,
        substitute: teamData.substitute,
        phone: teamData.phone,
        whatsapp: teamData.whatsapp,
        allocatedStage: teamData.allocatedStage,
        qualificationStatus: teamData.qualificationStatus || "pending",
        registrationOrder: teamData.registrationOrder || 1,
        tournamentId: teamData.tournamentId || "og-season-1",
      },
    });
  } catch (err: any) {
    console.error("[TEAM VERIFY API ERROR]:", err);
    return NextResponse.json(
      { error: "Verification failed. Please check your credentials." },
      { status: 500 }
    );
  }
}
