"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Wallet, Car, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/login-actions";

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Klienci", icon: Users },
  { href: "/finance", label: "Finanse", icon: Wallet },
  { href: "/vehicles", label: "Samochody", icon: Car },
];

export function isNavLinkActive(pathname: string, href: string) {
  return (
    pathname === href || (href === "/finance" && pathname.startsWith("/finance"))
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-20 shrink-0 flex-col items-center border-r border-sidebar-border bg-sidebar py-6 text-sidebar-foreground sm:flex">
      <Link
        href="/dashboard"
        className="mb-8 flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground"
      >
        C
      </Link>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {NAV_LINKS.map((link) => {
          const active = isNavLinkActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={cn(
                "flex size-11 items-center justify-center rounded-xl text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active && "bg-sidebar-primary text-sidebar-primary-foreground"
              )}
            >
              <Icon className="size-5" />
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-2">
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
      </div>
    </aside>
  );
}
