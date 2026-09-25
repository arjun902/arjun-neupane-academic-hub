import Link from "next/link";
import { PageShell, SectionHeading } from "@/components/academic";
import { studentGuides, studentFaqs } from "@/content/students";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Student resources",
  "Guidance for projects, laboratories, assignments, research, internships and project defense.",
  "/students",
);
export default function Students() {
  return (
    <PageShell
      eyebrow="Learning & academic support"
      title="Make your next step clearer."
      description="Practical guidance for studying, building projects and communicating your work."
    >
      <div className="actions mb-8">
        <Link className="btn btn-primary" href="/teaching">
          Course materials →
        </Link>
        <Link className="btn btn-secondary" href="/resources">
          Find resources & past questions
        </Link>
        <Link className="text-link" href="/notices">
          Academic notices →
        </Link>
      </div>
      <p className="callout text-sm">
        This is general study guidance. Your institution’s current rules, course
        brief and supervisor’s instructions take precedence.
      </p>
      <nav className="semester-links" aria-label="Student guidance topics">
        {studentGuides.map((g) => (
          <a key={g.id} href={"#" + g.id}>
            {g.title}
          </a>
        ))}
      </nav>
      <div className="prose">
        {studentGuides.map((g) => (
          <section id={g.id} key={g.id}>
            <h2>{g.title}</h2>
            <ol>
              {g.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <section className="section faq">
        <SectionHeading title="Common questions" />
        {studentFaqs.map((f) => (
          <details key={f.question}>
            <summary>{f.question}</summary>
            <p>{f.answer}</p>
          </details>
        ))}
      </section>
    </PageShell>
  );
}
