import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }

    const matchRef = doc(db, "matches", id);
    const snap = await getDoc(matchRef);

    if (!snap.exists()) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const data = snap.data();
    const now = Date.now();

    // Determine Match Start Time and Room Reveal Time
    let startTimeMs = 0;
    if (data.matchStartTime) {
      startTimeMs = new Date(data.matchStartTime).getTime();
    } else if (data.matchTime) {
      startTimeMs = new Date(data.matchTime).getTime();
    }

    let revealTimeMs = 0;
    if (data.roomRevealTime) {
      revealTimeMs = new Date(data.roomRevealTime).getTime();
    } else if (startTimeMs > 0) {
      // Default: 10 minutes before match start time
      revealTimeMs = startTimeMs - 10 * 60 * 1000;
    }

    const isLive = data.status === "live";

    // Server Validation: Must NOT expose Room ID or Password before reveal time (unless live)
    if (!isLive && (revealTimeMs === 0 || now < revealTimeMs)) {
      const remainingSeconds = revealTimeMs > 0 ? Math.max(0, Math.floor((revealTimeMs - now) / 1000)) : 0;
      return NextResponse.json({
        canView: false,
        revealTime: revealTimeMs > 0 ? new Date(revealTimeMs).toISOString() : null,
        matchStartTime: startTimeMs > 0 ? new Date(startTimeMs).toISOString() : null,
        remainingSeconds,
      });
    }

    // Current Time >= Reveal Time (or status is live): Return secure credentials
    return NextResponse.json({
      canView: true,
      roomId: data.roomId || "Not Set",
      roomPassword: data.roomPassword || "Not Set",
      revealTime: revealTimeMs > 0 ? new Date(revealTimeMs).toISOString() : new Date().toISOString(),
      matchStartTime: startTimeMs > 0 ? new Date(startTimeMs).toISOString() : new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[ROOM REVEAL API ERROR]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to validate room reveal" },
      { status: 500 }
    );
  }
}
