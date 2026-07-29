"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";

export function HeadersConditional({ type }: { type: "navbar" | "footer" }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  if (type === "navbar") return <Navbar />;
  return <Footer />;
}
