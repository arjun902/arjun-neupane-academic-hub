import Link from "next/link";
import { notices } from "@/content/notices";
import { PageShell, EmptyState } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Academic notices",
  "Confirmed academic announcements and an archive of published notices.",
  "/notices",
);
export default function Notices() {
  const sorted = [...notices].sort((a, b) => b.date.localeCompare(a.date));
  const years = [...new Set(sorted.map((n) => n.date.slice(0, 4)))];
  return (
    <PageShell
      eyebrow="Announcements & archive"
      title="Academic notices"
      description="Published updates for teaching, academic activities and student guidance."
    >
      {years.map((y) => (
        <section key={y}>
          <h2>{y}</h2>
          {sorted
            .filter((n) => n.date.startsWith(y))
            .map((n) => (
              <article key={n.id} id={n.id} className="resource-card">
                <div>
                  <p className="eyebrow">
                    {n.category} · <time dateTime={n.date}>{n.date}</time>
                  </p>
                  <h3>{n.title}</h3>
                  <p>{n.body}</p>
                  {n.link && (
                    <Link className="text-link" href={n.link}>
                      Read more →
                    </Link>
                  )}
                </div>
              </article>
            ))}
        </section>
      ))}
      {!notices.length && (
        <EmptyState title="No notices currently published">
          Check your institution’s official communication channels for schedules
          and deadlines.
        </EmptyState>
      )}
    </PageShell>
  );
}
