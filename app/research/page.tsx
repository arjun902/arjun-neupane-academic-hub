import Link from "next/link";
import { researchInterests, researchProjects } from "@/content/research";
import { PageShell, SectionHeading } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Research & supervision",
  "Quantum information research, FPGA processor design, space-system projects and student supervision.",
  "/research",
);
export default function Research() {
  return (
    <PageShell
      eyebrow="Inquiry & scholarship"
      title="Questions that connect theory and practice."
      description="Research interests across computing and engineering, with an emphasis on clear questions, practical investigation and student learning."
    >
      <SectionHeading title="Areas of interest" />
      <div className="research-list">
        {researchInterests.map((r) => (
          <article key={r.title}>
            <h3>{r.title}</h3>
            <p>{r.description}</p>
          </article>
        ))}
      </div>
      <section id="projects" className="section">
        <SectionHeading title="Selected thesis & engineering projects" />
        {researchProjects.map((p) => (
          <article className="card mb-6" key={p.title}>
            <p className="eyebrow">{p.status}</p>
            <h3>{p.title}</h3>
            {p.period && (
              <p className="text-sm">
                {p.period}
                {p.institution ? ` · ${p.institution}` : ""}
              </p>
            )}
            <p>{p.description}</p>
            {p.url && (
              <a className="text-link" href={p.url}>
                View project →
              </a>
            )}
          </article>
        ))}
        <div className="prose">
          <h2>Student supervision & mentoring</h2>
          <p>
            Student support includes shaping a project question, choosing an
            achievable scope, planning implementation and evaluating results. A
            useful starting point is a short proposal describing your question,
            current progress and the kind of feedback you need.
          </p>
          <h3>Approach & methods</h3>
          <p>
            Match the method to the question: a simulation for a well-defined
            model, a prototype for a practical idea, or an experiment with
            explicit comparison criteria. Record assumptions and make the work
            reproducible.
          </p>
          <h3>Writing & presenting</h3>
          <p>
            Explain the motivation, distinguish your contribution from prior
            work and support conclusions with evidence. Prepare to discuss
            limitations as carefully as results.
          </p>
          <Link href="/students#research" className="text-link">
            Student research checklist →
          </Link>
        </div>
      </section>
      <div className="callout">
        <h2 className="text-2xl">Academic collaboration</h2>
        <p>
          For a research or mentoring conversation, share the topic, context,
          available evidence and a focused proposal.
        </p>
        <div className="actions">
          <Link href="/contact" className="btn btn-secondary">
            Start a conversation
          </Link>
          <Link href="/publications" className="text-link">
            Publication record →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
