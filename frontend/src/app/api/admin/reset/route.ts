import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "st7je4cw";
const API_KEY = process.env.CLOUDINARY_API_KEY || "746745946526193";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "MCLKiJEUwp0ayo4IpilCzIhSXWs";

function extractPublicId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename.split(".")[0] || null;
  } catch {
    return null;
  }
}

async function deleteCloudinaryImages(publicIds: string[]) {
  if (!publicIds.length) return 0;
  try {
    const authHeader = "Basic " + Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64");
    
    const params = new URLSearchParams();
    publicIds.forEach((id) => params.append("public_ids[]", id));

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();
    console.log("[CLOUDINARY BATCH DELETE]:", data);
    return Object.keys(data.deleted || {}).length;
  } catch (err) {
    console.error("[CLOUDINARY DELETE ERROR]:", err);
    return 0;
  }
}

export async function POST() {
  try {
    console.log("=========================================");
    console.log("[RESET TOURNAMENT DATABASE INITIATED]");

    // 1. Fetch all registrations
    const regSnap = await getDocs(collection(db, "registrations"));
    const publicIds: string[] = [];
    const regDocRefs = regSnap.docs.map((d) => {
      const data = d.data();
      if (data.paymentScreenshotUrl) {
        const pid = extractPublicId(data.paymentScreenshotUrl);
        if (pid) publicIds.push(pid);
      }
      return d.ref;
    });

    // 2. Delete Cloudinary payment screenshots
    let deletedImagesCount = 0;
    if (publicIds.length > 0) {
      deletedImagesCount = await deleteCloudinaryImages(publicIds);
    }

    // 3. Batch delete registrations (chunks of 400)
    let deletedRegsCount = 0;
    for (let i = 0; i < regDocRefs.length; i += 400) {
      const chunk = regDocRefs.slice(i, i + 400);
      const batch = writeBatch(db);
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
      deletedRegsCount += chunk.length;
    }

    // 4. Delete notifications & logs collections (if existing)
    try {
      const notifSnap = await getDocs(collection(db, "notifications"));
      if (!notifSnap.empty) {
        const b = writeBatch(db);
        notifSnap.docs.forEach((d) => b.delete(d.ref));
        await b.commit();
      }
    } catch {}

    try {
      const logsSnap = await getDocs(collection(db, "logs"));
      if (!logsSnap.empty) {
        const b = writeBatch(db);
        logsSnap.docs.forEach((d) => b.delete(d.ref));
        await b.commit();
      }
    } catch {}

    // 5. Reset registration counter to 0
    const countRef = doc(db, "settings", "registrationCount");
    await setDoc(countRef, { count: 0, updatedAt: new Date().toISOString() });

    const completedAt = new Date().toISOString();
    console.log(`[RESET SUCCESS] Regs Deleted: ${deletedRegsCount}, Images Deleted: ${deletedImagesCount}`);
    console.log("=========================================");

    return NextResponse.json({
      success: true,
      deletedRegistrations: deletedRegsCount,
      deletedImages: deletedImagesCount,
      counterReset: true,
      completedAt,
    });
  } catch (err: any) {
    console.error("[RESET TOURNAMENT ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reset tournament database" },
      { status: 500 }
    );
  }
}
