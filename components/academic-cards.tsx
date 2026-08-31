import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, CalendarRange, FlaskConical, GraduationCap } from "lucide-react";
import type { AcademicProgram, CourseOffering, SemesterNumber } from "@/lib/academics";

export function ProgramCard({ program }: { program: AcademicProgram }) {
  const offeringCount = program.semesters.reduce((total, semester) => total + semester.offerings.length, 0);

  return (
    <article className="card flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <span className="icon-box"><GraduationCap size={22} /></span>
        <span className="tag">{program.shortName}</span>
      </div>
      <h3 className="text-2xl font-bold text-ink">{program.name}</h3>
      <p className="mt-3 flex-1 text-muted">{program.description}</p>
      <div className="my-5 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-slate-50 py-3 text-center">
        <ProgramMetric value={`${program.durationYears}`} label="Years" />
        <ProgramMetric value={`${program.semesterCount}`} label="Semesters" />
        <ProgramMetric value={`${offeringCount}`} label="Collections" />
      </div>
      <Link className="btn btn-secondary w-full" href={`/subjects/${program.slug}`}>
        Browse {program.shortName} resources <ArrowUpRight size={18} />
      </Link>
    </article>
  );
}

export function CourseCard({
  programSlug,
  semesterNumber,
  course
}: {
  programSlug: AcademicProgram["slug"];
  semesterNumber: SemesterNumber;
  course: CourseOffering;
}) {
  const route = `/subjects/${programSlug}/semester-${semesterNumber}/${course.slug}`;

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-[0_1px_0_rgba(18,38,63,0.02)] transition hover:-translate-y-0.5 hover:border-teal/40 hover:shadow-soft">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="tag">{course.code}</span>
        <span className="pill">{course.credits} credits</span>
        {course.practical ? <span className="pill"><FlaskConical className="mr-1" size={14} /> Practical</span> : null}
      </div>
      <h4 className="text-xl font-bold text-ink">{course.name}</h4>
      <p className="mt-2 text-sm leading-6 text-muted">{course.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600" aria-label="Available resource sections">
        <span>Notes</span><span aria-hidden="true">·</span>
        <span>Assignments</span><span aria-hidden="true">·</span>
        <span>{course.practical ? "Lab Reports" : "Research Work"}</span><span aria-hidden="true">·</span>
        <span>Old Questions</span>
      </div>
      <Link className="btn btn-ghost mt-5" href={route}>
        <BookOpenCheck size={18} /> Open subject
      </Link>
    </article>
  );
}

export function RoadmapStep({
  number,
  title,
  body,
  final = false
}: {
  number: number;
  title: string;
  body: string;
  final?: boolean;
}) {
  return (
    <div className="relative rounded-lg border border-line bg-white p-5">
      {!final ? <span className="absolute -right-3 top-8 z-10 hidden h-px w-6 bg-teal/40 lg:block" aria-hidden="true" /> : null}
      <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white">
        {number}
      </span>
      <h3 className="font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}

export function ProgramMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2">
      <strong className="block text-lg text-navy">{value}</strong>
      <span className="block text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}

export function SemesterSummary({ number, courseCount }: { number: number; courseCount: number }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <CalendarRange className="text-teal-deep" size={18} />
      Semester {number} · {courseCount} available {courseCount === 1 ? "subject collection" : "subject collections"}
    </div>
  );
}
