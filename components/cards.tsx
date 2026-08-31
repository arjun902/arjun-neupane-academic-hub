import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function IconCard({
  icon: Icon,
  title,
  children,
  tone = "teal"
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "teal" | "gold" | "plum";
}) {
  const toneClass =
    tone === "gold" ? "bg-[#fff4dc] text-[#765019]" : tone === "plum" ? "bg-[#f8eaf0] text-plum" : "bg-teal/10 text-teal-deep";
  return (
    <article className="card">
      <span className={`icon-box ${toneClass}`}>
        <Icon size={22} />
      </span>
      <h3 className="mb-2 text-xl font-bold text-ink">{title}</h3>
      <div className="text-muted">{children}</div>
    </article>
  );
}

export function WorkshopCard({
  title,
  duration,
  audience,
  outcome,
  icon: Icon
}: {
  title: string;
  duration: string;
  audience: string;
  outcome: string;
  icon: LucideIcon;
}) {
  return (
    <article className="card">
      <span className="icon-box bg-[#fff4dc] text-[#765019]">
        <Icon size={22} />
      </span>
      <span className="tag">{duration}</span>
      <h3 className="mb-2 mt-4 text-xl font-bold text-ink">{title}</h3>
      <p className="mb-3 text-muted">{outcome}</p>
      <p className="mb-5 text-sm text-slate-700">
        <strong>For:</strong> {audience}
      </p>
      <Link href="/contact?purpose=Training" className="btn btn-secondary">
        <CalendarPlus size={18} />
        Ask about this workshop
      </Link>
    </article>
  );
}
