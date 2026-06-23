import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, Download, FileText, FlaskConical, ListChecks } from "lucide-react";
import { notFound } from "next/navigation";
import { IconCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";
import { UnitExplorer } from "@/components/unit-explorer";
import { subjects } from "@/lib/data";

export function generateStaticParams() {
  return subjects.map((subject) => ({ slug: subject.slug }));
}

type SubjectParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: SubjectParams }): Promise<Metadata> {
  const { slug } = await params;
  const subject = subjects.find((item) => item.slug === slug);
  return {
    title: subject ? `${subject.name} Notes and Labs` : "Subject Detail",
    description: subject
      ? `Course overview, syllabus, unit-wise notes, PDF materials, lab sheets, assignments, question bank, solutions and grading criteria for ${subject.name}.`
      : "Subject detail page."
  };
}

export default async function SubjectDetailPage({ params }: { params: SubjectParams }) {
  const { slug } = await params;
  const subject = subjects.find((item) => item.slug === slug);
  if (!subject) notFound();

  return (
    <main>
      <PageHero
        breadcrumb={`Home / Subjects / ${subject.name}`}
        title={subject.name}
        actions={
          <>
            <Link className="btn btn-primary" href="/materials"><Download size={18} /> Download notes</Link>
            <Link className="btn btn-secondary" href="/grading"><ClipboardCheck size={18} /> Grading updates</Link>
          </>
        }
      >
        Course overview, unit notes, practical labs, assignments, old questions, viva questions, grading criteria, and
        announcements for BCA, CSIT, and BE students.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <UnitExplorer />
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid gap-5 md:grid-cols-3">
          <IconCard icon={FileText} title="Course overview">
            TCP/IP model, network devices, routing, switching, subnetting, services, packet analysis, and security fundamentals.
          </IconCard>
          <IconCard icon={FlaskConical} title="Practical lab track" tone="gold">
            Packet Tracer, Wireshark, IP planning, service configuration, troubleshooting, and network documentation.
          </IconCard>
          <IconCard icon={ListChecks} title="Assessment criteria" tone="plum">
            Assignment status, lab performance, viva marks, internal progress, attendance, and individual feedback.
          </IconCard>
        </div>
      </section>
    </main>
  );
}
