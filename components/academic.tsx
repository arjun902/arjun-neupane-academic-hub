import Link from "next/link";
import type { ReactNode } from "react";
import type { AcademicProgram, Course, Resource } from "@/content/types";
import { site, asset } from "@/content/site";
import { courseResources } from "@/lib/content";
export function StructuredData({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          {items.map((i, index) => (
            <li key={index}>
              {i.href ? (
                <Link href={i.href}>{i.label}</Link>
              ) : (
                <span aria-current="page">{i.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ label: "Home", href: "/" }, ...items].map(
            (i, n) => ({
              "@type": "ListItem",
              position: n + 1,
              name: i.label,
              item: i.href ? site.url + i.href : undefined,
            }),
          ),
        }}
      />
    </>
  );
}
export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
    </div>
  );
}
export function PageShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main id="main-content" className="site-container page-shell">
      <Breadcrumbs items={[{ label: title }]} />
      <PageIntro {...{ eyebrow, title, description }} />
      {children}
    </main>
  );
}
export function SectionHeading({
  label,
  title,
  href,
  linkText = "View all",
}: {
  label?: string;
  title: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {label && <p className="eyebrow">{label}</p>}
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkText} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function ProgrammeCard({ program }: { program: AcademicProgram }) {
  return (
    <article className="card programme-card">
      <p className="eyebrow">Teaching collection</p>
      <h3>
        <Link href={`/subjects/${program.slug}`}>{program.shortName}</Link>
      </h3>
      <p className="program-name">{program.name}</p>
      <p>{program.description}</p>
      <Link className="text-link" href={`/subjects/${program.slug}`}>
        Explore semesters <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
export function CourseCard({
  course,
  path,
  program,
  semester,
}: {
  course: Course;
  path: string;
  program?: string;
  semester?: number;
}) {
  const count = courseResources(course.slug, program, semester).length;
  return (
    <article className="card">
      <span className="tag">
        {count
          ? `${count} resource${count === 1 ? "" : "s"} available`
          : "Materials forthcoming"}
      </span>
      <h3 className="mt-4">
        <Link href={path}>{course.name}</Link>
      </h3>
      <p>{course.summary}</p>
      <Link className="text-link" href={path}>
        View subject <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
export function ResourceCard({ resource: r }: { resource: Resource }) {
  const href = r.externalUrl || (r.fileUrl ? asset(r.fileUrl) : undefined);
  return (
    <article className="resource-card">
      <div>
        <p className="eyebrow">
          {r.type}
          {r.credit ? ` · ${r.credit}` : ""}
        </p>
        <h3>{r.title}</h3>
        <p>{r.description}</p>
        {r.date && <time dateTime={r.date}>{r.date}</time>}
        <div className="resource-tags">
          {r.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      {href && (
        <div className="shrink-0">
          <a className="text-link" href={href}>
            {r.externalUrl
              ? "Visit source ↗"
              : /\.[a-z0-9]+$/i.test(href)
                ? "Open file →"
                : "Read guide →"}
          </a>
          {r.fileUrl?.startsWith("/resources/") && (
            <a className="text-link block" href={href} download>
              Download
            </a>
          )}
        </div>
      )}
    </article>
  );
}
