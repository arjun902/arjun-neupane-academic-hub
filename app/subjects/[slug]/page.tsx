import Link from "next/link";
import { notFound } from "next/navigation";
import { programmes, catalogNotice } from "@/content/programmes";
import { programBySlug, courseById, coursePath } from "@/lib/content";
import { Breadcrumbs, PageIntro, CourseCard } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...programmes.map((p) => ({ slug: p.slug })),
    { slug: "csit" },
    { slug: "be" },
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = programBySlug((await params).slug);
  return p
    ? pageMetadata(
        p.shortName + " teaching resources",
        p.description,
        "/subjects/" + p.slug,
      )
    : {};
}
export default async function Program({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = programBySlug((await params).slug);
  if (!p) notFound();
  return (
    <main id="main-content" className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Teaching", href: "/teaching" },
          { label: p.shortName },
        ]}
      />
      <PageIntro
        eyebrow="Program collection"
        title={p.name}
        description={p.description}
      />
      <p className="callout text-sm">{catalogNotice}</p>
      <nav className="semester-links" aria-label="Semesters">
        {p.semesters.map((s) => (
          <Link
            key={s.number}
            href={"/subjects/" + p.slug + "/semester-" + s.number}
          >
            Semester {s.number}
          </Link>
        ))}
      </nav>
      {p.semesters.map((s) => (
        <section
          key={s.number}
          className="section border-b border-line"
          id={"semester-" + s.number}
        >
          <div className="section-heading">
            <h2>Semester {s.number}</h2>
            <Link
              className="text-link"
              href={"/subjects/" + p.slug + "/semester-" + s.number}
            >
              View semester →
            </Link>
          </div>
          <div className="grid-three">
            {s.courseIds.map((id) => (
              <CourseCard
                key={id}
                course={courseById(id)!}
                path={coursePath(p.slug, s.number, id)}
                program={p.slug}
                semester={s.number}
              />
            ))}
          </div>
          {!s.courseIds.length && (
            <p>Materials for this semester have not been published yet.</p>
          )}
        </section>
      ))}
    </main>
  );
}
