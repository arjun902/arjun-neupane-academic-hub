import { notFound } from "next/navigation";
import { offerings, courseResources } from "@/lib/content";
import {
  Breadcrumbs,
  PageIntro,
  ResourceCard,
  EmptyState,
} from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
export const dynamicParams = false;
export const generateStaticParams = () =>
  offerings.map((o) => ({
    slug: o.program.slug,
    semester: "semester-" + o.semester,
    subject: o.course.slug,
  }));
type Props = {
  params: Promise<{ slug: string; semester: string; subject: string }>;
};
async function get(params: Props["params"]) {
  const p = await params;
  return offerings.find(
    (o) =>
      o.program.slug === p.slug &&
      "semester-" + o.semester === p.semester &&
      o.course.slug === p.subject,
  );
}
export async function generateMetadata({ params }: Props) {
  const o = await get(params);
  return o
    ? pageMetadata(
        o.course.name + " · " + o.program.shortName,
        o.course.summary,
        o.path,
      )
    : {};
}
export default async function Subject({ params }: Props) {
  const o = await get(params);
  if (!o) notFound();
  const c = o.course;
  const rs = courseResources(c.slug, o.program.slug, o.semester);
  const types = [...new Set(rs.map((r) => r.type))];
  return (
    <main id="main-content" className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Teaching", href: "/teaching" },
          { label: o.program.shortName, href: "/subjects/" + o.program.slug },
          {
            label: "Semester " + o.semester,
            href: "/subjects/" + o.program.slug + "/semester-" + o.semester,
          },
          { label: c.name },
        ]}
      />
      <PageIntro
        eyebrow={o.program.shortName + " · Semester " + o.semester}
        title={c.name}
        description={c.summary}
      />
      <div className="course-layout">
        <details open className="course-sidebar">
          <summary>On this page</summary>
          <nav aria-label="Subject sections">
            <a href="#materials">Learning resources</a>
            <a href="#outline">Outline & topics</a>
            <a href="#practice">Assignments & lab work</a>
            <a href="#past-questions">Past questions</a>
            <Link href="/resources">Search all materials</Link>
          </nav>
        </details>
        <div className="course-content">
          <section id="materials">
            <h2>Learning resources</h2>
            <p>
              Open a resource below. External references are hosted by their
              original publishers.
            </p>
            {types.map((type) => (
              <div key={type} className="mt-6">
                <h3>{type}</h3>
                {rs
                  .filter((r) => r.type === type)
                  .map((r) => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
              </div>
            ))}
            {!rs.length && (
              <EmptyState title="Materials forthcoming">
                No resources have been published for this subject yet.
              </EmptyState>
            )}
          </section>
          <section id="outline">
            <h2>Outline & study topics</h2>
            <p className="mb-5 text-muted">
              These are study themes for this collection. Use your institution’s
              current syllabus for official units and assessment requirements.
            </p>
            {c.units.length ? (
              c.units.map((u) => (
                <article key={u.id} id={u.id} className="card mb-4">
                  <h3>{u.title}</h3>
                  <ul className="list-disc pl-5 mt-4">
                    {u.topics.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  {rs
                    .filter((r) => r.unit === u.id)
                    .map((r) => (
                      <ResourceCard key={r.id} resource={r} />
                    ))}
                </article>
              ))
            ) : (
              <EmptyState title="Detailed outline forthcoming">
                A verified unit-by-unit course outline has not been added. Start
                with the references above.
              </EmptyState>
            )}
          </section>
          <section id="practice">
            <h2>Assignments & lab work</h2>
            {rs.filter(
              (r) =>
                r.type === "Assignment" ||
                r.type === "Lab" ||
                r.type === "Sample code",
            ).length ? (
              <p>Available practice materials are listed above.</p>
            ) : (
              <p>
                Course-specific assignments and lab sheets have not been
                published here yet.
              </p>
            )}
            <Link href="/students#labs" className="text-link">
              Read general lab and report guidance →
            </Link>
          </section>
          <section id="past-questions">
            <h2>Past questions</h2>
            {rs.some((r) => r.type === "Past questions") ? (
              <p>Published past papers are listed in the resources above.</p>
            ) : (
              <p>
                No verified past question papers have been published for this
                collection.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
