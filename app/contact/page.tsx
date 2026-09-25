import { profile } from "@/content/profile";
import { PageShell } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Contact",
  "Professional contact and academic conversations with Arjun Neupane in Kathmandu, Nepal.",
  "/contact",
);
export default function Contact() {
  return (
    <PageShell
      eyebrow="Academic conversations"
      title="Get in touch."
      description="For teaching, workshops, student mentoring and research collaboration."
    >
      <div className="grid-two">
        <section>
          <h2 className="text-3xl">Professional profiles</h2>
          <p className="lead">{profile.location}</p>
          <div className="mt-6">
            {profile.links.map((l) => (
              <a key={l.url} href={l.url} className="resource-card">
                <span className="font-semibold">{l.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
        <section className="callout">
          <h2 className="text-2xl">Help make the conversation useful</h2>
          <p>
            For course questions, include your program, semester and subject.
            For project mentoring, include a brief problem statement and your
            current progress. For workshops, describe the audience and learning
            objectives.
          </p>
          <p>
            Use LinkedIn for professional enquiries. Do not share student grades
            or personal records in public repository issues.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
