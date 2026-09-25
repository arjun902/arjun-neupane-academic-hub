import Link from "next/link";
import { activities } from "@/content/activities";
import { PageShell, SectionHeading } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Activities & workshops",
  "Workshop and mentoring topics in computing, research and practical technology.",
  "/activities",
);
export default function Activities() {
  return (
    <PageShell
      eyebrow="Workshops · Training · Mentoring"
      title="Learning together, through practice."
      description="Academic activities and practical learning, from international space-system training to workshop and mentoring topics."
    >
      {(["completed", "offering"] as const).map((status) => (
        <section key={status} className="mb-10">
          <SectionHeading
            title={
              status === "completed"
                ? "Selected academic activity"
                : "Workshop & mentoring offerings"
            }
          />
          {status === "offering" && (
            <p className="mb-5 text-muted">
              Available topics for discussion, without confirmed event dates.
            </p>
          )}
          <div className="timeline">
            {activities
              .filter((a) => a.status === status)
              .map((a) => (
                <article key={a.title}>
                  <div>
                    <p className="eyebrow">{a.category}</p>
                    {a.date ? (
                      <time dateTime={a.date}>{a.dateLabel || a.date}</time>
                    ) : (
                      <span className="text-sm text-muted">
                        Workshop offering
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl">{a.title}</h3>
                    <p>{a.description}</p>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ))}
      <div className="callout mt-8">
        <h2 className="text-2xl">Discuss a workshop</h2>
        <p>
          Include the audience, current experience, learning objectives and
          proposed schedule.
        </p>
        <Link className="text-link" href="/contact">
          Contact Arjun →
        </Link>
      </div>
    </PageShell>
  );
}
