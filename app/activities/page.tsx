import Link from "next/link";
import { activities } from "@/content/activities";
import { PageShell } from "@/components/academic";
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
      description="Topics for practical workshops and academic mentoring. These are offerings, not a calendar of confirmed events."
    >
      <div className="timeline">
        {activities.map((a) => (
          <article key={a.title}>
            <div>
              <p className="eyebrow">{a.category}</p>
              {a.date ? (
                <time dateTime={a.date}>{a.date}</time>
              ) : (
                <span className="text-sm text-muted">Workshop offering</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl">{a.title}</h2>
              <p>{a.description}</p>
            </div>
          </article>
        ))}
      </div>
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
