"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
const items = [
  ["Home", "/"],
  ["Teaching", "/courses"],
  ["Research", "/research"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (url: string) =>
    url === "/"
      ? pathname === "/"
      : pathname.startsWith(url) ||
        (url === "/courses" &&
          (pathname.startsWith("/student") ||
            pathname.startsWith("/subjects")));
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[#f8f7f3]/95 backdrop-blur-md">
      <div className="site-container flex h-20 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Arjun Neupane home"
          className="flex items-center gap-3"
        >
          <span className="border-r border-line pr-3 font-serif text-3xl text-navy">
            AN<span className="text-gold">.</span>
          </span>
          <span>
            <strong className="block text-sm text-navy">Arjun Neupane</strong>
            <span className="text-xs text-muted">
              Teaching · Research · Open resources
            </span>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-6 lg:flex"
        >
          {items.map(([label, url]) => (
            <Link
              key={url}
              href={url}
              aria-current={active(url) ? "page" : undefined}
              className={
                active(url)
                  ? "border-b-2 border-teal-deep py-2 text-sm font-bold text-teal-deep"
                  : "py-2 text-sm text-muted hover:text-navy"
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/courses" className="btn btn-primary hidden lg:inline-flex">
          Explore courses <ArrowUpRight size={16} />
        </Link>
        <button
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          className="btn btn-secondary lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
        className="border-t border-line bg-white px-4 py-3 lg:hidden"
      >
        {items.map(([label, url]) => (
          <Link
            key={url}
            href={url}
            onClick={() => setOpen(false)}
            aria-current={active(url) ? "page" : undefined}
            className="block rounded px-4 py-3 font-semibold text-navy"
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
