"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/finance", label: "Wpłaty" },
  { href: "/finance/unassigned", label: "Nieprzypisane wpłaty" },
  { href: "/finance/contracts", label: "Umowy" },
];

export function FinanceTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex gap-1 rounded-xl border border-border bg-card p-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
