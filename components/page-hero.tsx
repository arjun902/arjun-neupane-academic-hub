import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  breadcrumb,
  title,
  children,
  actions
}: {
  breadcrumb: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="page-hero py-16 text-white md:py-20">
      <div className="site-container">
        <div className="mb-4 text-sm font-extrabold text-white/75">{breadcrumb}</div>
        <h1 className="h1 max-w-3xl text-white">{title}</h1>
        <div className="mt-5 max-w-3xl text-base leading-8 text-white/88">{children}</div>
        {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-bold text-teal-deep hover:text-navy">
      {children}
    </Link>
  );
}
