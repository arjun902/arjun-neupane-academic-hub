import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Download } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { WorkshopCard } from "@/components/cards";
import { workshops } from "@/lib/data";

export const metadata: Metadata = {
  title: "Workshops and Training",
  description: "Practical workshops for students and academic teams on computing, research writing, project tools, cybersecurity, IoT, and AI."
};

export default function WorkshopsPage() {
  return (
    <main>
      <PageHero
        breadcrumb="Home / Workshops"
        title="Workshops and Training"
        actions={
          <>
            <Link className="btn btn-primary" href="/contact?purpose=Training"><CalendarPlus size={18} /> Request workshop</Link>
            <Link className="btn btn-secondary" href="/subjects"><Download size={18} /> Browse subject resources</Link>
          </>
        }
      >
        I offer workshops for classes, project teams, and academic departments. Each session combines a concise
        explanation with guided exercises and time for questions.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <p className="eyebrow">Available workshops</p>
          <h2 className="h2">Short courses with guided practice.</h2>
          <p className="mb-8 mt-4 max-w-3xl text-muted">
            Duration and content can be adjusted to the participants' level and the time available. Use the contact form
            to discuss the group, prerequisites, schedule, and intended learning outcomes.
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
