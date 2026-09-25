import { notFound } from "next/navigation";
import { phaseCourses } from "@/lib/portal";
import { CourseLearning } from "@/components/course-learning";
export const dynamicParams = false;
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
    title: phaseCourses.find((c) => c.id === course)?.name || "Course",
    robots: { index: false, follow: true },
  };
}
export default async function CoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = await params;
  if (!phaseCourses.some((c) => c.id === course)) notFound();
  return <CourseLearning key={course} courseId={course} />;
}
