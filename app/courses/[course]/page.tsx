import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/academic";
import { offerings } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
const routes: Record<string, [string, string]> = {
  "bca-digital-logic": ["bca", "digital-logic"],
  "bca-c-programming": ["bca", "c-programming"],
  "csit-compiler-design": ["bsc-csit", "compiler-design"],
  "csit-cryptography": ["bsc-csit", "cryptography"],
  "csit-numerical-methods": ["bsc-csit", "numerical-methods"],
  "csit-discrete-mathematics": ["bsc-csit", "discrete-mathematics"],
};
export const dynamicParams = false;
export const generateStaticParams = () =>
  Object.keys(routes).map((course) => ({ course }));
export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = await params;
  const entry = routes[course];
  const o =
    entry &&
    offerings.find(
      (o) => o.program.slug === entry[0] && o.course.slug === entry[1],
    );
  return pageMetadata(
    o?.course.name || "Course collection",
    "Open teaching resources and subject collections.",
    o?.path || "/teaching",
  );
}
export default async function LegacyCourse({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const entry = routes[(await params).course];
  if (!entry) notFound();
  const o = offerings.find(
    (o) => o.program.slug === entry[0] && o.course.slug === entry[1],
  );
  return (
    <PageShell
      eyebrow="Teaching collection"
      title={o?.course.name || "Discrete Mathematics"}
      description="Course materials are now organised by program, semester and subject."
    >
      <Link
        className="btn btn-primary"
        href={o?.path || "/teaching/discrete-mathematics"}
      >
        Open learning resources →
      </Link>
    </PageShell>
  );
}
