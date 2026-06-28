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
  description: "Professional academic profile of Er. Arjun Neupane, Computer Engineer, Lecturer, Researcher and Academic Mentor in Kathmandu, Nepal."
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
        Computer Engineer, lecturer, researcher, and academic mentor focused on practical learning, academic clarity, and
        research-oriented technology education.
      </PageHero>

      <section className="section">
        <div className="site-container grid items-start gap-10 lg:grid-cols-[0.95fr_0.7fr]">
          <div>
            <p className="eyebrow">Professional introduction</p>
            <h2 className="h2">Academic credibility with a modern technology teaching practice.</h2>
            <p className="mt-5 text-muted">
              {profile.summary}
            </p>
            <p className="mt-4 text-muted">
              This website is designed as both a professional portfolio and a student learning resource platform, making
              materials, notices, grading updates, and mentoring pathways easier to access.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn btn-primary" href="/materials"><LibraryBig size={18} /> Explore resources</Link>
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
                <li className="flex gap-3 text-slate-700"><Presentation className="text-teal-deep" size={20} /> Lecturer for BCA, CSIT, and BE-related courses.</li>
                <li className="flex gap-3 text-slate-700"><BookOpenCheck className="text-teal-deep" size={20} /> Mentor for projects, internship reports, workshops, and research papers.</li>
                <li className="flex gap-3 text-slate-700"><MapPin className="text-teal-deep" size={20} /> {profile.location}</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container">
          <p className="eyebrow">Current affiliations</p>
          <h2 className="h2 mb-8">Currently working with leading academic institutions.</h2>
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
          <p className="eyebrow">Academic focus</p>
          <h2 className="h2 mb-8">Areas of teaching and research interest.</h2>
          <div className="grid gap-5 md:grid-cols-3">
            <IconCard icon={Atom} title="Quantum Computing and AI">
              Student-friendly research entry points, simulation tools, literature framing, and emerging computing paradigms.
            </IconCard>
            <IconCard icon={Router} title="Networking and Cybersecurity" tone="gold">
              Network administration, secure systems, practical labs, threat awareness, and infrastructure fundamentals.
            </IconCard>
            <IconCard icon={Blocks} title="Software and IoT Systems" tone="plum">
              Project architecture, embedded systems, databases, UI/UX, automation, and academic software tooling.
            </IconCard>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container grid gap-10 lg:grid-cols-[0.7fr_1fr]">
          <div>
            <p className="eyebrow">Academic journey</p>
            <h2 className="h2">Built around teaching, mentoring, and applied research.</h2>
          </div>
          <div className="grid gap-6 border-l-2 border-line pl-6">
            {[
              ["Engineering foundation", "Computer Engineering background with a focus on systems, networks, programming, and applied computing."],
              ["Graduate specialization", "MSc Information and Communication Engineering with research orientation in modern computing systems."],
              ["Teaching practice", "Lecturing and mentoring BCA, CSIT, and BE students through theory, labs, assignments, and projects."],
              ["Resource platform", "Building a structured, searchable academic hub for notes, grading, notices, workshops, and student support."]
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
