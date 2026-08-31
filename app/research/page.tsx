import type { Metadata } from "next";
import Link from "next/link";
import { Atom, BrainCircuit, Handshake, Newspaper, Router, ShieldCheck, Wrench, Cpu } from "lucide-react";
import { IconCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Research and Projects",
  description: "Research interests, student project supervision, and academic writing guidance from Er. Arjun Neupane."
};

export default function ResearchPage() {
  return (
    <main>
      <PageHero
        breadcrumb="Home / Research"
        title="Research and Projects"
        actions={
          <>
            <Link className="btn btn-primary" href="/contact?purpose=Research"><Handshake size={18} /> Discuss a project</Link>
            <Link className="btn btn-secondary" href="/blog"><Newspaper size={18} /> Read research articles</Link>
          </>
        }
      >
        I study computing topics through practical experiments and undergraduate projects. I also supervise students
        from the initial research question through the written report and presentation.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <p className="eyebrow">Research interests</p>
          <h2 className="h2 mb-8">Research areas for student projects.</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <IconCard icon={Atom} title="Quantum Computing">I focus on introductory concepts and simulation-based projects that are manageable at undergraduate level.</IconCard>
            <IconCard icon={BrainCircuit} title="AI and Machine Learning" tone="gold">I guide applied projects that define a clear question, use appropriate data, and report evaluation results.</IconCard>
            <IconCard icon={ShieldCheck} title="Cybersecurity" tone="plum">Projects examine common risks in applications and networks, then document practical defensive measures.</IconCard>
            <IconCard icon={Router} title="Computer Networks">My work covers network design, service configuration, troubleshooting, and performance measurement.</IconCard>
            <IconCard icon={Cpu} title="IoT Systems" tone="gold">Students build sensor-based prototypes and document how data moves from devices to dashboards.</IconCard>
            <IconCard icon={Wrench} title="Tools for Teaching" tone="plum">I explore simple tools that improve how course materials, assessments, and notices are managed.</IconCard>
          </div>
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Project work", "My project work includes teaching tools, course resource systems, IoT prototypes, and applied computing experiments."],
            ["Student project supervision", "I help students narrow a topic, plan an evaluation, organise the implementation, and prepare for the viva."],
            ["Academic papers", "I help students revise abstracts, organise papers, check citations, and prepare a manuscript for submission."],
            ["Theses and proposals", "I support students in defining a research question, setting a realistic scope, choosing a method, and planning the work."],
            ["Conference preparation", "I help students prepare presentations and posters, respond to feedback, and explain their work clearly."],
            ["Research collaboration", "I welcome enquiries from colleges, academic teams, students, and researchers interested in a joint project or training session."]
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
