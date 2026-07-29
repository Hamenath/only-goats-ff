import type { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Tournament highlights, match screenshots, and memories from Only Goats FF.",
};

export default function GalleryPage() {
  return (
    <div style={{ paddingTop: 80 }}>
      <section className="gradient-mesh" style={{ padding: "80px 0 60px" }}>
        <div className="container-custom" style={{ textAlign: "center" }}>
          <span className="badge badge-accent" style={{ marginBottom: 24 }}>📸 Gallery</span>
          <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "#111", letterSpacing: "-0.04em", marginBottom: 20 }}>
            Gallery
          </h1>
          <p style={{ fontSize: 18, color: "#666", maxWidth: 480, margin: "0 auto" }}>
            Highlights, match moments, and champion celebrations.
          </p>
        </div>
      </section>
      <section style={{ padding: "60px 0 120px" }}>
        <div className="container-custom">
          {/* Empty state */}
          <div style={{ textAlign: "center", padding: "80px 0", border: "2px dashed #eaeaea", borderRadius: 22 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <ImageIcon size={32} style={{ color: "#ccc" }} />
            </div>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: 24, fontWeight: 700, color: "#111", marginBottom: 12 }}>
              Gallery Coming Soon
            </h3>
            <p style={{ fontSize: 15, color: "#999", maxWidth: 380, margin: "0 auto 28px" }}>
              Match highlights and champion moments will appear here after the tournament.
            </p>
            <Link href="/register" className="btn-accent">
              Register to Compete
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
