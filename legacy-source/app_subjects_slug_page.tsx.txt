import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck, CalendarRange, CircleAlert, FileStack } from "lucide-react";
import { notFound } from "next/navigation";
import { CourseCard, ProgramMetric, SemesterSummary } from "@/components/academic-cards";
import { PageHero } from "@/components/page-hero";
import { academicPrograms, getProgram } from "@/lib/academics";

export const dynamicParams = false;

export function generateStaticParams() {
  return academicPrograms.map((program) => ({ slug: program.slug }));
}

type ProgramParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: ProgramParams }): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  return {
    title: program ? `${program.shortName} Teaching Resources by Semester` : "Academic Program",
    description: program
      ? `Browse the ${program.name} subject-resource collections currently available across eight semester sections.`
      : "Available academic teaching resources."
  };
}

export default async function ProgramPage({ params }: { params: ProgramParams }) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();

  const offeringCount = program.semesters.reduce((total, semester) => total + semester.offerings.length, 0);

  return (
    <main>
      <PageHero
        breadcrumb={`Home / Academic Programs / ${program.shortName}`}
        title={`${program.shortName} teaching resources by semester`}
        actions={
          <Link className="btn btn-secondary" href="/subjects">
            <ArrowLeft size={18} /> All programs
          </Link>
        }
      >
        Browse the {program.name} subjects currently included in this collection. Each subject page gathers the teaching,
        practice, research, and assessment material available for that course.
      </PageHero>

      <section className="section pb-8 md:pb-10">
        <div className="site-container">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <p className="eyebrow">Program overview</p>
              <h2 className="h2">A semester-based view of the available subjects.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                {program.description} The list is selective and will expand as new teaching material is prepared.
              </p>
              <nav className="mt-6 flex flex-wrap gap-2" aria-label="Jump to semester">
                {program.semesters.map((semester) => (
                  <a className="pill transition hover:bg-teal/15 hover:text-teal-deep" href={`#semester-${semester.number}`} key={semester.number}>
                    Semester {semester.number}
                  </a>
                ))}
              </nav>
            </div>
            <aside className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <div className="grid grid-cols-3 divide-x divide-line text-center">
                <ProgramMetric value={`${program.durationYears}`} label="Years" />
                <ProgramMetric value={`${program.semesterCount}`} label="Semesters" />
                <ProgramMetric value={`${offeringCount}`} label="Collections" />
              </div>
              <div className="mt-5 flex gap-3 border-t border-line pt-5 text-sm text-muted">
                <CircleAlert className="mt-0.5 shrink-0 text-gold" size={19} />
                <p>{program.catalogNotice}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="site-container grid gap-12">
          {[1, 2, 3, 4].map((year) => {
            const semesters = program.semesters.filter((semester) => semester.year === year);
            return (
              <section key={year} aria-labelledby={`year-${year}-title`}>
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <p className="eyebrow">Academic year {year}</p>
                    <h2 className="text-3xl font-bold text-navy" id={`year-${year}-title`}>Year {year}</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-muted">
                    <CalendarRange size={18} /> Semesters {year * 2 - 1}–{year * 2}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  {semesters.map((semester) => (
                    <article className="scroll-mt-28 rounded-lg border border-line bg-slate-50 p-5 md:p-6" id={`semester-${semester.number}`} key={semester.number}>
                      <div className="mb-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <h3 className="text-2xl font-bold text-ink">{semester.label}</h3>
                          <span className="tag">{program.shortName}</span>
                        </div>
                        <SemesterSummary number={semester.number} courseCount={semester.offerings.length} />
                      </div>
                      <div className="grid gap-4">
                        {semester.offerings.map((course) => (
                          <CourseCard
                            key={`${semester.number}-${course.slug}`}
                            programSlug={program.slug}
                            semesterNumber={semester.number}
                            course={course}
                          />
                        ))}
                        {!semester.offerings.length ? (
                          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-muted">
                            No subject collection is currently published for this semester.
                          </p>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container grid gap-5 md:grid-cols-3">
          <ProgramFeature icon={CalendarRange} title="Semester-based browsing">Move directly to any semester and review the subjects currently available.</ProgramFeature>
          <ProgramFeature icon={BookOpenCheck} title="Clear subject context">Program, semester, roadmap code, and credit guidance remain visible on each subject page.</ProgramFeature>
          <ProgramFeature icon={FileStack} title="Purposeful collections">Resources are grouped as notes, assignments, practical or research work, and past questions.</ProgramFeature>
        </div>
      </section>
    </main>
  );
}

function ProgramFeature({ icon: Icon, title, children }: { icon: typeof CalendarRange; title: string; children: React.ReactNode }) {
  return (
    <article className="card">
      <span className="icon-box"><Icon size={22} /></span>
      <h3 className="text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 text-muted">{children}</p>
    </article>
  );
}
