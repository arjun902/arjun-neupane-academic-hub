import { notFound } from "next/navigation";
import { programmes, catalogNotice } from "@/content/programmes";
import { programBySlug, courseById, coursePath } from "@/lib/content";
import { Breadcrumbs, PageIntro, CourseCard } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const dynamicParams = false;
export const generateStaticParams = () =>
  programmes.flatMap((p) =>
    p.semesters.map((s) => ({
      slug: p.slug,
      semester: "semester-" + s.number,
    })),
  );
type Props = { params: Promise<{ slug: string; semester: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug, semester } = await params;
  const p = programBySlug(slug);
  return p
    ? pageMetadata(
        p.shortName + " · " + semester.replace("-", " "),
        "Subject resources organised by semester.",
        "/subjects/" + p.slug + "/" + semester,
      )
    : {};
}
export default async function Semester({ params }: Props) {
  const { slug, semester } = await params;
  const p = programBySlug(slug);
  const s = p?.semesters.find((s) => "semester-" + s.number === semester);
  if (!p || !s) notFound();
  return (
    <main id="main-content" className="site-container page-shell">
      <Breadcrumbs
        items={[
          { label: "Teaching", href: "/teaching" },
          { label: p.shortName, href: "/subjects/" + p.slug },
          { label: "Semester " + s.number },
        ]}
      />
      <PageIntro
        eyebrow={p.shortName}
        title={"Semester " + s.number}
        description="Select a subject to explore the available learning materials and references."
      />
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
      <p className="callout mt-8 text-sm">{catalogNotice}</p>
    </main>
  );
}
