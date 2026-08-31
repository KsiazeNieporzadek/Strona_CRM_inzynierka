"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function TableScrollArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const container = ref.current;
    const scrollEl = container?.querySelector(
      '[data-slot="table-container"]'
    ) as HTMLElement | null;
    if (!scrollEl) return;

    function update() {
      if (!scrollEl) return;
      setCanScrollLeft(scrollEl.scrollLeft > 4);
      setCanScrollRight(
        scrollEl.scrollLeft + scrollEl.clientWidth < scrollEl.scrollWidth - 4
      );
    }

    update();
    scrollEl.addEventListener("scroll", update);
    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);
    return () => {
      scrollEl.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [children]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
    >
      {children}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card to-transparent transition-opacity",
          canScrollLeft ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card to-transparent transition-opacity",
          canScrollRight ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
