"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/data";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/95 backdrop-blur-xl">
      <div className="site-container flex h-[76px] items-center justify-start gap-3 lg:justify-between lg:gap-5">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Er. Arjun Neupane home">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-teal font-extrabold text-white">
            AN
          </span>
          <span className="hidden leading-tight sm:block">
            <strong className="block text-sm text-ink">Er. Arjun Neupane</strong>
            <span className="block text-xs text-muted">Academic Resource Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {navItems.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  active ? "bg-teal/10 text-teal-deep" : "text-slate-700 hover:bg-teal/10 hover:text-teal-deep"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-primary hidden lg:inline-flex">
            <LogIn size={18} />
            Login
          </Link>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line bg-white text-navy lg:hidden"
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-line bg-white px-4 py-3 shadow-soft lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-site gap-1">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-3 text-sm font-bold text-slate-700 hover:bg-teal/10 hover:text-teal-deep"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/login" className="btn btn-primary mt-2" onClick={() => setOpen(false)}>
              <LogIn size={18} />
              Login
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
