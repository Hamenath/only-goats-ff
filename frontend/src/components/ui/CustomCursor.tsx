"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX - 4, y: mouseY - 4 });
    };

    const animate = () => {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      gsap.set(cursor, { x: curX - 20, y: curY - 20 });
      requestAnimationFrame(animate);
    };
    animate();

    const onEnterLink = () => {
      gsap.to(cursor, { scale: 1.6, opacity: 0.8, duration: 0.3 });
    };
    const onLeaveLink = () => {
      gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3 });
    };

    document.addEventListener("mousemove", onMove);
    document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", onEnterLink);
      el.addEventListener("mouseleave", onLeaveLink);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div id="custom-cursor" aria-hidden="true">
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid rgba(17,17,17,0.5)",
          pointerEvents: "none",
          zIndex: 9998,
          mixBlendMode: "normal",
          transition: "opacity 0.3s",
        }}
      />
      <div
        ref={cursorDotRef}
        style={{
          position: "fixed",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#e50914",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />
    </div>
  );
}
