import type { Metadata } from "next";
import { BookOpenCheck, CalendarRange, FileStack, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProgramCard, RoadmapStep } from "@/components/academic-cards";
import { PageHero } from "@/components/page-hero";
import { academicPrograms } from "@/lib/academics";

export const metadata: Metadata = {
  title: "Academic Programs and Subject Resources",
  description:
    "Browse the teaching-resource collections currently available for selected BSc CSIT, BCA, and BE Computer Engineering subjects."
};

export default function SubjectsPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Academic Programs" title="Browse teaching resources by program and semester.">
        Choose BSc CSIT, BCA, or BE Computer Engineering, locate the relevant semester, and open one of the subject
        collections currently available.
      </PageHero>

      <section className="section">
        <div className="site-container">
          <div className="mb-8 max-w-3xl">
            <p className="eyebrow">Available subject collections</p>
            <h2 className="h2">Selected resources, arranged in a familiar academic sequence.</h2>
            <p className="mt-4 text-muted">
              This growing catalog is organized across eight semester sections for each program. It is a teaching-resource
              guide, not a complete or official university curriculum; confirm course placement, codes, and credits with
              your institution.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {academicPrograms.map((program) => <ProgramCard key={program.slug} program={program} />)}
          </div>
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container">
          <div className="mb-8 max-w-3xl">
            <p className="eyebrow">Using the catalog</p>
            <h2 className="h2">Move from your program to the material you need.</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-4">
            <RoadmapStep number={1} title="Choose a program" body="BSc CSIT, BCA, or BE Computer Engineering." />
            <RoadmapStep number={2} title="Review a semester" body="See which subject collections are currently included." />
            <RoadmapStep number={3} title="Open a subject" body="Read its overview, roadmap code, credit guide, and study mode." />
            <RoadmapStep number={4} title="Use the resources" body="Find notes, assignments, practical or research work, and past questions." final />
          </div>

          <div className="mt-8 grid gap-4 rounded-lg border border-line bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <ResourcePrinciple icon={GraduationCap} title="Program context retained" />
            <ResourcePrinciple icon={CalendarRange} title="Semester sections" />
            <ResourcePrinciple icon={BookOpenCheck} title="Subject-level collections" />
            <ResourcePrinciple icon={FileStack} title="Four focused resource types" />
          </div>
        </div>
      </section>
    </main>
  );
}

function ResourcePrinciple({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
      <Icon className="shrink-0 text-teal-deep" size={20} /> {title}
    </div>
  );
}
