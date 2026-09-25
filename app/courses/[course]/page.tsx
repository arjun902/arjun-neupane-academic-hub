import { notFound } from "next/navigation";
import { PublicResources } from "@/components/public-resources";
import { phaseCourses } from "@/lib/portal";
export function generateStaticParams() {
  return phaseCourses.map((c) => ({ course: c.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = await params;
  return {
    title:
      phaseCourses.find((c) => c.id === course)?.name || "Course materials",
  };
}
export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = await params;
  if (!phaseCourses.some((c) => c.id === course)) notFound();
  return <PublicResources courseId={course} />;
}
