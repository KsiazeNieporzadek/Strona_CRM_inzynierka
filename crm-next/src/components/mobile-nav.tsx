"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV_LINKS, isNavLinkActive } from "@/components/sidebar";
import { logout } from "@/app/login-actions";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-sidebar-border bg-sidebar px-2 py-2 text-sidebar-foreground sm:hidden">
      {NAV_LINKS.map((link) => {
        const active = isNavLinkActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl text-sidebar-foreground/60 transition",
              active && "bg-sidebar-primary text-sidebar-primary-foreground"
            )}
          >
            <Icon className="size-5" />
          </Link>
        );
      })}
      <ThemeToggle
        variant="sidebar"
        className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      />
      <form action={logout}>
        <button
          type="submit"
          title="Wyloguj"
          className="flex size-11 items-center justify-center rounded-xl text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-5" />
        </button>
      </form>
    </nav>
  );
}
