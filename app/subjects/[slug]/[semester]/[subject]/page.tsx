import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, CalendarRange, FlaskConical, GraduationCap, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { CourseCard } from "@/components/academic-cards";
import { CourseResourceExplorer } from "@/components/course-resource-explorer";
import { PageHero } from "@/components/page-hero";
import { allOfferings, getOffering, getProgram } from "@/lib/academics";

export const dynamicParams = false;

export function generateStaticParams() {
  return allOfferings.map((offering) => ({
    slug: offering.programSlug,
    semester: `semester-${offering.semesterNumber}`,
    subject: offering.slug
  }));
}

type SubjectParams = Promise<{ slug: string; semester: string; subject: string }>;

function semesterNumber(value: string) {
  const match = /^semester-([1-8])$/.exec(value);
  return match ? Number(match[1]) : Number.NaN;
}

export async function generateMetadata({ params }: { params: SubjectParams }): Promise<Metadata> {
  const { slug, semester, subject } = await params;
  const offering = getOffering(slug, semesterNumber(semester), subject);
  const appliedResource = offering?.practical === false ? "research work" : "lab reports";
  return {
    title: offering ? `${offering.name} | ${offering.programShortName} Semester ${offering.semesterNumber}` : "Subject Resources",
    description: offering
      ? `Teaching resources currently available for ${offering.name} in ${offering.programShortName} Semester ${offering.semesterNumber}, including notes, assignments, ${appliedResource}, and past questions.`
      : "Available subject teaching resources."
  };
}

export default async function SubjectResourcePage({ params }: { params: SubjectParams }) {
  const { slug, semester, subject } = await params;
  const semesterNo = semesterNumber(semester);
  const offering = getOffering(slug, semesterNo, subject);
  const program = getProgram(slug);
  if (!offering || !program) notFound();

  const semesterData = program.semesters.find((item) => item.number === semesterNo);
  if (!semesterData) notFound();
  const related = semesterData.offerings.filter((item) => item.slug !== offering.slug);
  const programOfferings = allOfferings.filter((item) => item.programSlug === program.slug);
  const currentIndex = programOfferings.findIndex((item) => item.route === offering.route);
  const previousOffering = currentIndex > 0 ? programOfferings[currentIndex - 1] : null;
  const nextOffering = currentIndex >= 0 && currentIndex < programOfferings.length - 1
    ? programOfferings[currentIndex + 1]
    : null;

  return (
    <main>
      <PageHero
        breadcrumb={`Home / ${program.shortName} / Semester ${semesterNo} / ${offering.name}`}
        title={offering.name}
        actions={
          <>
            <Link className="btn btn-secondary" href={`/subjects/${program.slug}#semester-${semesterNo}`}>
              <ArrowLeft size={18} /> Back to Semester {semesterNo}
            </Link>
            <Link className="btn btn-primary" href="/login">
              <LockKeyhole size={18} /> Sign in for course files
            </Link>
          </>
        }
      >
        {program.name} · Semester {semesterNo} · {offering.code}. Review the subject overview and the teaching materials
        currently available below.
      </PageHero>

      <section className="border-b border-line bg-white py-5">
        <div className="site-container">
          <ol className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4" aria-label="Academic resource path">
            <PathStep number={1} label="Program" value={program.shortName} href={`/subjects/${program.slug}`} />
            <PathStep number={2} label="Semester" value={`Semester ${semesterNo}`} href={`/subjects/${program.slug}#semester-${semesterNo}`} />
            <PathStep number={3} label="Subject" value={offering.name} />
            <PathStep number={4} label="Resources" value="4 collections" current />
          </ol>
        </div>
      </section>

      <section className="section pb-8 md:pb-10">
        <div className="site-container grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Fact icon={BookOpenCheck} label="Roadmap code" value={offering.code} />
          <Fact icon={GraduationCap} label="Credit guide" value={`${offering.credits} credits`} />
          <Fact icon={CalendarRange} label="Program position" value={`${program.shortName} · Semester ${semesterNo}`} />
          <Fact icon={FlaskConical} label="Learning mode" value={offering.practical ? "Theory + practical" : "Theory / research"} />
        </div>
        <div className="site-container mt-6">
          <div className="rounded-lg border border-line bg-slate-50 p-5">
            <p className="eyebrow">Subject overview</p>
            <p className="max-w-4xl text-slate-700">{offering.summary}</p>
          </div>
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="site-container">
          <CourseResourceExplorer
            programName={program.name}
            programShortName={program.shortName}
            semesterNumber={semesterNo}
            course={offering}
          />
        </div>
      </section>

      <section className="section pt-0 md:pt-0">
        <div className="site-container">
          <div className="mb-6 max-w-3xl">
            <p className="eyebrow">Subject sequence</p>
            <h2 className="h2">Continue through the available {program.shortName} collection.</h2>
          </div>
          <nav className="grid gap-4 md:grid-cols-2" aria-label={`${program.shortName} previous and next subjects`}>
            {previousOffering ? (
              <Link className="rounded-lg border border-line bg-white p-5 shadow-soft transition hover:border-teal/50" href={previousOffering.route}>
                <span className="mb-3 flex items-center gap-2 text-sm font-extrabold text-teal-deep">
                  <ArrowLeft size={17} /> Previous subject
                </span>
                <strong className="block text-lg text-ink">{previousOffering.name}</strong>
                <span className="mt-1 block text-sm text-muted">Semester {previousOffering.semesterNumber}</span>
              </Link>
            ) : (
              <div className="rounded-lg border border-line bg-slate-50 p-5">
                <span className="text-sm font-extrabold text-muted">Start of the collection</span>
                <strong className="mt-3 block text-lg text-ink">This is the first available {program.shortName} subject.</strong>
              </div>
            )}
            {nextOffering ? (
              <Link className="rounded-lg border border-line bg-white p-5 text-right shadow-soft transition hover:border-teal/50" href={nextOffering.route}>
                <span className="mb-3 flex items-center justify-end gap-2 text-sm font-extrabold text-teal-deep">
                  Next subject <ArrowRight size={17} />
                </span>
                <strong className="block text-lg text-ink">{nextOffering.name}</strong>
                <span className="mt-1 block text-sm text-muted">Semester {nextOffering.semesterNumber}</span>
              </Link>
            ) : (
              <div className="rounded-lg border border-line bg-slate-50 p-5 text-right">
                <span className="text-sm font-extrabold text-muted">End of the collection</span>
                <strong className="mt-3 block text-lg text-ink">You have reached the final available {program.shortName} subject.</strong>
              </div>
            )}
          </nav>
        </div>
      </section>

      {related.length ? (
        <section className="section section-band">
          <div className="site-container">
            <div className="mb-7 max-w-3xl">
              <p className="eyebrow">Also in this semester</p>
              <h2 className="h2">More available subjects in Semester {semesterNo}.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {related.map((course) => (
                <CourseCard
                  key={course.slug}
                  programSlug={program.slug}
                  semesterNumber={semesterData.number}
                  course={course}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function PathStep({
  number,
  label,
  value,
  href,
  current = false
}: {
  number: number;
  label: string;
  value: string;
  href?: string;
  current?: boolean;
}) {
  const content = (
    <span className="flex min-w-0 items-center gap-3 rounded-lg border border-line bg-slate-50 px-4 py-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-white">{number}</span>
      <span className="min-w-0">
        <span className="block text-[10px] font-extrabold uppercase tracking-wide text-muted">{label}</span>
        <strong className="block truncate text-ink">{value}</strong>
      </span>
    </span>
  );
  return <li aria-current={current ? "step" : undefined}>{href ? <Link href={href}>{content}</Link> : content}</li>;
}

function Fact({ icon: Icon, label, value }: { icon: typeof BookOpenCheck; label: string; value: string }) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <Icon className="mb-3 text-teal-deep" size={22} />
      <span className="block text-xs font-extrabold uppercase tracking-wide text-muted">{label}</span>
      <strong className="mt-1 block text-ink">{value}</strong>
    </article>
  );
}
