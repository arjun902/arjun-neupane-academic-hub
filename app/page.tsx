import Link from "next/link";
import { ArrowUpRight, Atom, BookOpen, GraduationCap } from "lucide-react";
import { Catalogue, PublicAnnouncements } from "@/components/catalogue";
export default function Home() {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <main id="main-content">
      <section className="academic-hero border-b border-line">
        <div className="site-container grid items-center gap-12 py-16 md:py-20 lg:grid-cols-[1.45fr_0.65fr]">
          <div>
            <p className="eyebrow">
              Er. Arjun Neupane / Computer engineer & educator
            </p>
            <h1 className="h1 max-w-3xl">
              Teaching with clarity.
              <br />
              <span className="text-teal-deep">
                Exploring through research.
              </span>
            </h1>
            <p className="lead mt-6 max-w-2xl">
              A shared space for learning computer science, developing practical
              skills, and exploring ideas in quantum information and computing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="btn btn-primary">
                Explore courses <ArrowUpRight size={17} />
              </Link>
              <Link href="/research" className="btn btn-secondary">
                View research
              </Link>
            </div>
            <p className="mt-5 text-sm text-muted">
              Open course materials. No registration or password.
            </p>
          </div>
          <aside className="profile-panel">
            <img
              src={`${base}/assets/arjun-neupane-profile.png`}
              alt="Er. Arjun Neupane"
              width={360}
              height={400}
              className="aspect-[4/4.3] w-full rounded-t object-cover object-top"
            />
            <div className="border-t border-line bg-white p-5">
              <p className="font-serif text-xl text-navy">Er. Arjun Neupane</p>
              <p className="mt-1 text-sm text-muted">
                Computer engineering · Teaching · Research
              </p>
              <Link
                href="/about"
                className="mt-3 inline-block text-sm font-bold text-teal-deep"
              >
                Academic profile →
              </Link>
            </div>
          </aside>
        </div>
      </section>
      <Catalogue />
      <section className="section-band py-14">
        <div className="site-container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Research & inquiry</p>
              <h2 className="h2">Ideas beyond the classroom.</h2>
            </div>
            <Link href="/research" className="font-bold text-teal-deep">
              Explore research →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              [
                Atom,
                "Quantum information",
                "Exploring quantum computing, entanglement, and simulation-based research.",
              ],
              [
                BookOpen,
                "Computing education",
                "Clear explanations, practical exercises, and tools that support student learning.",
              ],
              [
                GraduationCap,
                "Student projects",
                "Guidance in defining problems, evaluating solutions, and communicating results.",
              ],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof Atom;
              return (
                <article key={String(title)} className="card">
                  <I className="mb-5 text-teal-deep" size={25} />
                  <h3 className="font-serif text-xl font-bold text-navy">
                    {String(title)}
                  </h3>
                  <p className="mt-3 text-muted">{String(body)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className="site-container grid gap-8 py-14 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow">A simple place to begin</p>
          <h2 className="h2">
            From curiosity
            <br />
            to understanding.
          </h2>
        </div>
        <ol className="grid gap-5 sm:grid-cols-3">
          {[
            ["01", "Find your course", "Choose your programme and subject."],
            [
              "02",
              "Explore a topic",
              "Browse published units, notes, slides, and practical work.",
            ],
            [
              "03",
              "Learn at your pace",
              "Read online or download available files for revision.",
            ],
          ].map(([n, title, body]) => (
            <li key={n} className="border-t border-line pt-4">
              <span className="font-serif text-2xl text-teal-deep">{n}</span>
              <h3 className="mt-3 font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <PublicAnnouncements />
    </main>
  );
}
