import type { Metadata } from "next";
import Link from "next/link";
import { Atom, BrainCircuit, Handshake, Newspaper, Router, ShieldCheck, Wrench, Cpu } from "lucide-react";
import { IconCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Research and Projects",
  description: "Research interests, ongoing projects, student research supervision, publication support and collaboration invitations by Er. Arjun Neupane."
};

export default function ResearchPage() {
  return (
    <main>
      <PageHero
        breadcrumb="Home / Research"
        title="Research and Projects"
        actions={
          <>
            <Link className="btn btn-primary" href="/contact"><Handshake size={18} /> Collaborate</Link>
            <Link className="btn btn-secondary" href="/blog"><Newspaper size={18} /> Read research articles</Link>
          </>
        }
      >
        Research interests, student project supervision, publication support, thesis guidance, conference mentoring, and
        collaboration opportunities.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <p className="eyebrow">Research interests</p>
          <h2 className="h2 mb-8">Technology areas with strong student research potential.</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <IconCard icon={Atom} title="Quantum Computing">Conceptual foundations, algorithm exploration, simulation, and beginner-friendly literature reviews.</IconCard>
            <IconCard icon={BrainCircuit} title="AI and Machine Learning" tone="gold">Applied ML projects, datasets, academic tools, automation, and responsible AI awareness.</IconCard>
            <IconCard icon={ShieldCheck} title="Cybersecurity" tone="plum">Threat modeling, secure applications, network defense, authentication, and practical security labs.</IconCard>
            <IconCard icon={Router} title="Computer Networks">Network services, infrastructure, administration, troubleshooting, and performance-oriented project work.</IconCard>
            <IconCard icon={Cpu} title="IoT Systems" tone="gold">Sensor networks, embedded prototypes, dashboards, data collection, and classroom-scale deployments.</IconCard>
            <IconCard icon={Wrench} title="Academic Tools" tone="plum">Automation systems for materials, grading, notices, analytics, and student engagement workflows.</IconCard>
          </div>
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Ongoing Projects", "Academic tools, learning resource systems, IoT prototypes, and applied computing experiments."],
            ["Student Research Projects", "Topic selection, proposal framing, evaluation design, implementation planning, and viva preparation."],
            ["Publication Support", "Abstract refinement, paper structure, citations, journal or conference fit, and revision discipline."],
            ["Thesis and Proposal Guidance", "Research questions, scope control, methodology, timeline, and defense-ready documentation."],
            ["Conference Mentorship", "Presentation design, poster preparation, review responses, and communication clarity."],
            ["Collaboration Invitation", "Open to colleges, academic teams, and technology learners seeking structured mentoring or workshops."]
          ].map(([title, body]) => (
            <article className="card" key={title}>
              <h3 className="mb-2 text-xl font-bold">{title}</h3>
              <p className="text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
