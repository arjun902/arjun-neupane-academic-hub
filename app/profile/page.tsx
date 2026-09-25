import Image from "next/image";
import Link from "next/link";
import { profile } from "@/content/profile";
import { asset } from "@/content/site";
import { PageShell } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Academic profile",
  profile.summary,
  "/profile",
);
export default function Profile() {
  return (
    <PageShell
      eyebrow="Academic profile"
      title={profile.name}
      description={profile.headline}
    >
      <div className="profile-layout">
        <div>
          <Image
            src={asset(profile.photo)}
            width={260}
            height={325}
            alt="Arjun Neupane"
          />
          <p className="mt-4 text-sm text-muted">{profile.location}</p>
          <Link href="/contact" className="text-link">
            Get in touch →
          </Link>
          <nav
            aria-label="Profile sections"
            className="mt-5 flex flex-col items-start text-sm"
          >
            {[
              ["Education", "education"],
              ["Teaching experience", "teaching-experience"],
              ["Engineering experience", "engineering-experience"],
              ["Recognition", "recognition"],
              ["Skills", "skills"],
              ["Certifications", "certifications"],
            ].map(([label, id]) => (
              <a className="text-link" key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="prose">
          <h2>Teaching, practice & inquiry</h2>
          <p>{profile.summary}</p>
          <section id="education">
            <h2>Academic background</h2>
            {profile.education.map((e) => (
              <article key={e.degree} className="border-t border-line py-5">
                <p className="text-sm text-muted">{e.period}</p>
                <h3>{e.degree}</h3>
                <p className="font-semibold text-teal">{e.institution}</p>
                {e.distinction && <p>{e.distinction}</p>}
                {e.project && <p>{e.project}</p>}
              </article>
            ))}
          </section>
          {(["Teaching", "Engineering"] as const).map((category) => (
            <section id={category.toLowerCase() + "-experience"} key={category}>
              <h2>{category} experience</h2>
              {profile.experience
                .filter((e) => e.category === category)
                .map((e) => (
                  <article
                    className="border-t border-line py-5"
                    key={e.institution}
                  >
                    <p className="text-sm text-muted">
                      {e.period} · {e.location}
                    </p>
                    <h3>{e.institution}</h3>
                    <p className="font-semibold text-teal">{e.role}</p>
                    {e.subjects && (
                      <p>
                        <strong>Subjects:</strong> {e.subjects.join(", ")}.
                      </p>
                    )}
                    <p>{e.focus}</p>
                  </article>
                ))}
            </section>
          ))}
          <section id="recognition">
            <h2>Recognition</h2>
            {profile.achievements.map((a) => (
              <article className="callout" key={a.title}>
                <p className="eyebrow">{a.year}</p>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
              </article>
            ))}
          </section>
          <section id="skills">
            <h2>Technical & teaching skills</h2>
            <div className="grid-two">
              {profile.skills.map((s) => (
                <article className="card" key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.items.join(" · ")}</p>
                </article>
              ))}
            </div>
          </section>
          <section id="certifications">
            <h2>Certifications</h2>
            {profile.certifications.map((c) => (
              <article
                className="border-t border-line py-5"
                key={c.credentialId}
              >
                <p className="text-sm text-muted">
                  {c.issued} · {c.issuer}
                </p>
                <h3>{c.title}</h3>
                <p className="text-sm">Credential ID: {c.credentialId}</p>
                {c.url && (
                  <a href={c.url} className="text-link">
                    View credential →
                  </a>
                )}
              </article>
            ))}
            <a
              href={profile.links.find((l) => l.label === "LinkedIn")!.url}
              className="text-link"
            >
              View LinkedIn profile →
            </a>
          </section>
          <h2>Approach to learning</h2>
          <p>
            Connect concepts with implementation, use laboratory work to test
            understanding, and support students in explaining their decisions
            and evidence.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/teaching">
              Teaching collections
            </Link>
            <Link className="text-link" href="/research">
              Research interests →
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
