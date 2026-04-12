"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * On project pages, narrows the sidebar column slightly once the user scrolls
 * so the main column gains focus (pairs with “collapse / reduce sidebar” backlog).
 */
export default function ProjectShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 88);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "group/shell min-h-screen transition-[grid-template-columns] duration-300 ease-out md:grid",
        scrolled
          ? "md:grid-cols-[minmax(200px,17vw)_minmax(0,1fr)]"
          : "md:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)]",
      )}
    >
      {children}
    </div>
  );
}
