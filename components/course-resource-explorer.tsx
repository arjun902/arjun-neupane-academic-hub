// Legacy course pages must not revive public file or individual-account APIs.
import Link from "next/link";
import type { CourseOffering, ProgramSlug } from "@/lib/academics";
import { phaseCourses } from "@/lib/portal";
export function CourseResourceExplorer({
  course,
  programShortName,
}: {
  programSlug: ProgramSlug;
  programName: string;
  programShortName: string;
  semesterNumber: number;
  course: CourseOffering;
}) {
  const match = phaseCourses.find(
    (c) => c.name === course.name && c.program.includes(programShortName),
  );
  return (
    <section className="card">
      <h2 className="h2">Course learning materials</h2>
      <p className="my-4">
        Enter the course password provided by your instructor to access
        published materials.
      </p>
      <Link
        className="btn btn-primary"
        href={match ? `/courses/${match.id}` : "/courses"}
      >
        {match ? "Unlock Course" : "Access My Courses"}
      </Link>
    </section>
  );
}
