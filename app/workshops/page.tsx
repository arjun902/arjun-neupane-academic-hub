import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Download } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { WorkshopCard } from "@/components/cards";
import { workshops } from "@/lib/data";

export const metadata: Metadata = {
  title: "Workshops and Training",
  description: "Academic workshops in IoT, cybersecurity, Git and GitHub, Python and AI, research paper writing, internship reports, UI/UX and networking."
};

export default function WorkshopsPage() {
  return (
    <main>
      <PageHero
        breadcrumb="Home / Workshops"
        title="Workshops and Training"
        actions={
          <>
            <Link className="btn btn-primary" href="/contact"><CalendarPlus size={18} /> Request workshop</Link>
            <Link className="btn btn-secondary" href="/materials"><Download size={18} /> View materials</Link>
          </>
        }
      >
        Focused training for IoT, cybersecurity, Git and GitHub, Python and AI, research paper writing, internship
        reports, UI/UX, networking, and server administration.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <p className="eyebrow">Training catalog</p>
          <h2 className="h2">Designed for classrooms, project teams, and academic departments.</h2>
          <p className="mb-8 mt-4 max-w-3xl text-muted">
            Each workshop can include overview, duration, target students, learning outcomes, required tools,
            registration workflow, certificate details, and contact actions.
          </p>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <WorkshopCard {...workshop} key={workshop.title} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
