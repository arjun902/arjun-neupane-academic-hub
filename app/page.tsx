import Link from "next/link";
import Image from "next/image";
import { profile } from "@/content/profile";
import { site, asset } from "@/content/site";
import { programmes } from "@/content/programmes";
import { researchInterests, researchProjects } from "@/content/research";
import { notices } from "@/content/notices";
import { publications } from "@/content/publications";
import {
  SectionHeading,
  ProgrammeCard,
  StructuredData,
} from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Teaching, Research & Academic Resources",
  site.description,
  "/",
);
export default function Home() {
  return (
    <main id="main-content">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              name: profile.name,
              url: site.url + "/profile/",
              image: site.url + profile.photo,
              sameAs: profile.links.map((l) => l.url),
            },
            {
              "@type": "WebSite",
              name: site.name,
              url: site.url + "/",
              description: site.description,
            },
          ],
        }}
      />
      <section className="site-container hero">
        <div>
          <p className="eyebrow">Teaching · Research · Academic Resources</p>
          <h1>Arjun Neupane</h1>
          <p className="intro">
            Learning through curiosity.
            <br />
            Building through practice.
          </p>
          <p className="mt-5 text-sm font-semibold text-navy">
            {profile.headline}
          </p>
          <p className="lead">{profile.summary}</p>
          <div className="actions">
            <Link className="btn btn-primary" href="/teaching">
              Explore teaching →
            </Link>
            <Link className="btn btn-secondary" href="/profile">
              View profile
            </Link>
            <Link className="text-link" href="/research">
              Research →
            </Link>
          </div>
        </div>
        <figure className="portrait-frame">
          <Image
            src={asset(profile.photo)}
            alt="Arjun Neupane"
            width={760}
            height={950}
            priority
          />
          <figcaption className="portrait-caption">
            Computer science & engineering · Kathmandu, Nepal
          </figcaption>
        </figure>
      </section>
      <div className="site-container">
        <div className="snapshot">
          {profile.snapshot.map((item) => (
            <div key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <section className="site-container section">
        <SectionHeading
          label="For learners"
          title="Find your course. Start learning."
          href="/resources"
          linkText="Search all resources"
        />
        <div className="grid-three">
          {programmes.map((p) => (
            <ProgrammeCard key={p.slug} program={p} />
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          Open teaching collections. Choose a program, semester and subject to
          browse available materials.
        </p>
      </section>
      <section className="section-band">
        <div className="site-container section">
          <SectionHeading
            label="Inquiry & scholarship"
            title="Research interests"
            href="/research"
            linkText="Explore research"
          />
          <div className="research-list">
            {researchInterests.slice(0, 4).map((r) => (
              <article key={r.title}>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
              </article>
            ))}
          </div>
          {publications.length > 0 && (
            <Link className="text-link" href="/publications">
              Browse publications →
            </Link>
          )}
        </div>
      </section>
      <section className="site-container section">
        <SectionHeading
          label="Selected work"
          title="From quantum information to hardware."
          href="/research#projects"
          linkText="Explore projects"
        />
        <div className="grid-three">
          {researchProjects.map((project) => (
            <article className="card" key={project.title}>
              <p className="eyebrow">
                {project.period} · {project.status}
              </p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <Link className="text-link" href="/research#projects">
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="site-container section">
        <SectionHeading
          label="Beyond the classroom"
          title="Support for your next step"
          href="/students"
          linkText="Student resources"
        />
        <div className="grid-three">
          {[
            [
              "Plan a project",
              "Turn an idea into a focused question, realistic milestones and a testable outcome.",
              "projects",
            ],
            [
              "Prepare for the lab",
              "Document your method, test your implementation and explain the result.",
              "labs",
            ],
            [
              "Write with evidence",
              "Develop a research question, read critically and cite sources clearly.",
              "research",
            ],
          ].map(([title, text, id]) => (
            <article className="card" key={id}>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href={"/students#" + id} className="text-link">
                Read guidance →
              </Link>
            </article>
          ))}
        </div>
      </section>
      {notices.length > 0 && (
        <section className="site-container section">
          <SectionHeading title="Academic updates" href="/notices" />
          {notices.slice(0, 3).map((n) => (
            <article className="resource-card" key={n.id}>
              <div>
                <time dateTime={n.date}>{n.date}</time>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            </article>
          ))}
        </section>
      )}
      <section className="section-band">
        <div className="site-container section grid-two">
          <div>
            <p className="eyebrow">Workshops & mentoring</p>
            <h2>From concepts to working ideas.</h2>
            <p className="lead">
              Practical learning in programming, IoT, cybersecurity, research
              writing and interface design.
            </p>
            <Link className="text-link mt-4" href="/activities">
              Explore workshop topics →
            </Link>
          </div>
          <div className="callout">
            <p className="eyebrow">Academic conversations</p>
            <h2>Connect & collaborate</h2>
            <p>
              For teaching, student mentoring and research conversations,
              explore the academic profile or get in touch.
            </p>
            <div className="actions">
              <Link className="btn btn-secondary" href="/profile">
                Academic profile
              </Link>
              <Link className="text-link" href="/contact">
                Contact →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
