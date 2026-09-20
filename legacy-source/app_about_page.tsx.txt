import type { Metadata } from "next";
import Link from "next/link";
import {
  Atom,
  BadgeCheck,
  Blocks,
  BookOpenCheck,
  Building2,
  ExternalLink,
  GraduationCap,
  LibraryBig,
  Linkedin,
  Mail,
  MapPin,
  Presentation,
  Router
} from "lucide-react";
import { IconCard } from "@/components/cards";
import { PageHero } from "@/components/page-hero";
import { profile } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Er. Arjun Neupane",
  description: "Teaching, engineering background, and research interests of Er. Arjun Neupane in Kathmandu, Nepal."
};

export default function AboutPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const profilePhoto = `${basePath}${profile.photo}`;

  return (
    <main>
      <PageHero
        breadcrumb="Home / About"
        title="About Er. Arjun Neupane"
        actions={
          <a className="btn btn-primary" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
            <Linkedin size={18} />
            View LinkedIn
            <ExternalLink size={16} />
          </a>
        }
      >
        I teach computing and engineering students in Kathmandu, with an emphasis on clear explanations, practical work,
        and careful research.
      </PageHero>

      <section className="section">
        <div className="site-container grid items-start gap-10 lg:grid-cols-[0.95fr_0.7fr]">
          <div>
            <p className="eyebrow">About me</p>
            <h2 className="h2">Teaching grounded in engineering and applied computing.</h2>
            <p className="mt-5 text-muted">
              I am a computer engineer and academic with a background in electrical and electronic engineering,
              communication systems, and applied computing. I teach and mentor BCA, BSc CSIT, and BE Computer
              Engineering students through lectures, lab work, projects, and research.
            </p>
            <p className="mt-4 text-muted">
              I use this website to share course resources, notices, grading updates, and information about mentoring and
              workshops.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn btn-primary" href="/subjects"><LibraryBig size={18} /> Browse course resources</Link>
              <a className="btn btn-secondary" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                <Linkedin size={18} />
                LinkedIn
              </a>
              <Link className="btn btn-gold" href="/contact"><Mail size={18} /> Contact</Link>
            </div>
          </div>
          <aside className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
            <img src={profilePhoto} alt="Er. Arjun Neupane" className="h-[380px] w-full object-cover object-center" />
            <div className="p-6">
              <p className="eyebrow">Profile highlights</p>
              <ul className="grid gap-4">
                <li className="flex gap-3 text-slate-700"><BadgeCheck className="text-teal-deep" size={20} /> {profile.backgroundHighlights[0]}</li>
                <li className="flex gap-3 text-slate-700"><GraduationCap className="text-teal-deep" size={20} /> {profile.backgroundHighlights[1]}</li>
                <li className="flex gap-3 text-slate-700"><Presentation className="text-teal-deep" size={20} /> Teaching across BCA, BSc CSIT, and BE Computer Engineering.</li>
                <li className="flex gap-3 text-slate-700"><BookOpenCheck className="text-teal-deep" size={20} /> I supervise student projects and advise on internship reports and research papers.</li>
                <li className="flex gap-3 text-slate-700"><MapPin className="text-teal-deep" size={20} /> {profile.location}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container">
          <p className="eyebrow">Current teaching affiliations</p>
          <h2 className="h2 mb-8">Institutions where I currently teach and mentor.</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {profile.currentRoles.map((role) => (
              <article className="card" key={role.institution}>
                <span className="icon-box">
                  <Building2 size={22} />
                </span>
                <h3 className="mb-2 text-xl font-bold">{role.institution}</h3>
                <p className="mb-3 text-sm font-extrabold text-teal-deep">{role.role}</p>
                <p className="text-muted">{role.focus}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <p className="eyebrow">Teaching and research</p>
          <h2 className="h2 mb-8">Areas I teach and study.</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <IconCard icon={Atom} title="Quantum Computing and AI">
              I use introductory simulations and focused reading to help students develop research questions suited to undergraduate projects.
            </IconCard>
            <IconCard icon={Router} title="Networking and Cybersecurity" tone="gold">
              I connect network theory and administration with laboratory exercises in configuration, diagnosis, and security.
            </IconCard>
            <IconCard icon={Blocks} title="Software and IoT Systems" tone="plum">
              I supervise projects that combine software, databases, embedded devices, and user interfaces.
            </IconCard>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.7fr_1fr]">
          <div>
            <p className="eyebrow">Academic background</p>
            <h2 className="h2">From engineering study to teaching and research.</h2>
          </div>
          <div className="grid gap-6 border-l-2 border-line pl-6">
            {[
              ["Engineering foundation", "My engineering background developed my interest in systems, networks, programming, and applied computing."],
              ["Graduate study", "I completed an MSc in Information and Communication Engineering with distinction."],
              ["Teaching practice", "I teach BCA, BSc CSIT, and BE Computer Engineering through lectures, labs, assignments, and projects."],
              ["Course resource library", "I maintain this site so students can find course materials and academic updates without searching across separate channels."]
            ].map(([title, body]) => (
              <div className="relative before:absolute before:-left-[31px] before:top-1 before:h-3 before:w-3 before:rounded-full before:border-4 before:border-white before:bg-gold before:ring-1 before:ring-line" key={title}>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
