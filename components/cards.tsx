import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Download } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Resource, Subject } from "@/lib/data";

export function SubjectCard({ subject, featured = false }: { subject: Subject; featured?: boolean }) {
  const Icon = subject.icon;
  return (
    <article className="card">
      <span className="icon-box">
        <Icon size={22} />
      </span>
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="tag">{subject.program}</span>
        <span className="pill">{subject.semester}</span>
      </div>
      <h3 className="mb-2 text-xl font-bold text-ink">{subject.name}</h3>
      <p className="mb-3 text-muted">{subject.summary}</p>
      <p className="mb-5 text-sm text-slate-700">
        <strong>Resources:</strong> {subject.resources}
      </p>
      <Link href={`/subjects/${subject.slug}`} className={`btn ${featured ? "btn-ghost" : "btn-secondary"}`}>
        <ArrowUpRight size={18} />
        View subject
      </Link>
    </article>
  );
}

export function ResourceCard({ item }: { item: Resource }) {
  return (
    <article className="card grid gap-5 md:grid-cols-[1fr_auto]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="tag">{item.program}</span>
          <span className="pill">{item.semester} semester</span>
          <span className="pill">{item.type}</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-ink">{item.title}</h3>
        <p className="mb-5 text-muted">
          {item.subject} material updated on {item.updated}. Includes classroom notes, practical guidance, and
          assessment-ready support.
        </p>
        <button className="btn btn-secondary" type="button">
          <Download size={18} />
          Download
        </button>
      </div>
      <div className="text-left text-sm font-bold text-muted md:text-right">
        <strong className="block text-2xl leading-none text-navy">{item.downloads.toLocaleString()}</strong>
        downloads
      </div>
    </article>
  );
}

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
        <strong>Target:</strong> {audience}
      </p>
      <Link href="/contact" className="btn btn-secondary">
        <CalendarPlus size={18} />
        Request seat
      </Link>
    </article>
  );
}
