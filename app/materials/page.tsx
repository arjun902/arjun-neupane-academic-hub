import type { Metadata } from "next";
import { Clock3, PackageCheck, TrendingUp } from "lucide-react";
import { IconCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";
import { ResourceHub } from "@/components/resource-hub";

export const metadata: Metadata = {
  title: "Student Resource Hub",
  description: "Search and filter BCA, CSIT and BE notes, slides, lab reports, assignments, question banks, solutions, project guidelines and internship report formats."
};

export default function MaterialsPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Materials" title="Student Resource Hub">
        Find recently updated materials, most downloaded resources, featured study packs, project guidelines, internship
        report formats, and research templates.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <ResourceHub />
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid gap-5 md:grid-cols-3">
          <IconCard icon={Clock3} title="Recently updated">
            Fresh notes, labs, and solution packs appear first so students can stay aligned with class progress.
          </IconCard>
          <IconCard icon={TrendingUp} title="Most downloaded" tone="gold">
            High-demand materials are structured for organic traffic and student discovery from search engines.
          </IconCard>
          <IconCard icon={PackageCheck} title="Featured study packs" tone="plum">
            Curated packs combine notes, labs, assignments, question banks, viva questions, and grading checklists.
          </IconCard>
        </div>
      </section>
    </main>
  );
}
