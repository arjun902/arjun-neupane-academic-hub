import { allOfferings } from "@/lib/academics";
import { phaseCourses } from "@/lib/portal";
import { PublicRedirect } from "@/components/public-redirect";
export const metadata = {
  title: "Open course resources",
  robots: { index: false, follow: true },
};
export function generateStaticParams() {
  return allOfferings.map((o) => ({
    slug: o.programSlug,
    semester: "semester-" + o.semesterNumber,
    subject: o.slug,
  }));
}
export default async function LegacyCourse({
  params,
}: {
  params: Promise<{ slug: string; subject: string }>;
}) {
  const { slug, subject } = await params;
  const id = `${slug === "bsc-csit" ? "csit" : slug}-${subject}`;
  return (
    <PublicRedirect
      to={phaseCourses.some((c) => c.id === id) ? `/courses/${id}` : "/courses"}
    />
  );
}
