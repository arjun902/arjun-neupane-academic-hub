import type { Metadata } from "next";
import Link from "next/link";
import { LibraryBig } from "lucide-react";
import { SubjectCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";
import { subjects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Subjects",
  description: "Subject-wise academic resources for BCA, CSIT and BE Computer Engineering students including programming, networking, cryptography, compiler design, quantum computing, DBMS, cybersecurity and research methodology."
};

export default function SubjectsPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Subjects" title="Subjects I Teach">
        Program-aware subject pages for notes, lab sheets, assignments, question banks, old questions, solutions, viva
        questions, projects, grading criteria, and announcements.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Subject catalog</p>
              <h2 className="h2">Structured academic resources across core computing courses.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                Each card becomes a full course page with syllabus, unit notes, PDFs, labs, assignments, question bank,
                solutions, and project ideas.
              </p>
            </div>
            <Link className="btn btn-primary" href="/materials"><LibraryBig size={18} /> Open resource hub</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard subject={subject} key={subject.slug} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
