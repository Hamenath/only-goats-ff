"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
};

let globalLenis: Lenis | null = null;

function ScrollToTopManager() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      if (globalLenis) {
        globalLenis.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [queryClient] = useState(() => new QueryClient(queryClientConfig));

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    if (isAdmin) {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
        document.body.classList.remove("lenis", "lenis-smooth", "lenis-stopped", "lenis-scrolling");
      }
      return;
    }

    // Register scroll trigger for public pages only
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });

    globalLenis = lenis;
    lenis.scrollTo(0, { immediate: true });

    lenis.on("scroll", ScrollTrigger.update);

    const tickHandler = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    return () => {
      globalLenis = null;
      lenis.destroy();
      gsap.ticker.remove(tickHandler);
    };
  }, [isAdmin]);

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTopManager />
      {children}
    </QueryClientProvider>
  );
}
