import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  Handshake,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Microscope,
  Presentation,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProgramCard, RoadmapStep } from "@/components/academic-cards";
import { WorkshopCard } from "@/components/cards";
import { academicPrograms } from "@/lib/academics";
import { posts, profile, workshops } from "@/lib/data";

export default function HomePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const profilePhoto = `${basePath}${profile.photo}`;

  return (
    <main>
      <section className="hero-bg relative overflow-hidden py-12 md:py-16">
        <div className="hero-fade absolute inset-x-0 bottom-0 h-28" />
        <div className="site-container relative z-10 grid min-h-[62vh] items-center gap-10 lg:grid-cols-[0.95fr_0.8fr]">
          <div className="min-w-0 max-w-[720px] overflow-hidden max-[480px]:max-w-[340px]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="eyebrow mb-0">Computer engineering education in Kathmandu</p>
              <span className="rounded-full border border-[#efd8ae] bg-[#fff7e8] px-3 py-1.5 text-xs font-extrabold text-[#7b561c]">
                MSc ICE
              </span>
            </div>
            <h1 className="h1 break-words">Er. Arjun Neupane</h1>
            <p className="mt-5 max-w-[320px] break-words font-extrabold text-teal-deep sm:max-w-none">Computer engineer and educator</p>
            <p className="lead mt-5 max-w-[340px] break-words sm:max-w-none">
              I teach BCA, BSc CSIT, and BE Computer Engineering students in Kathmandu. Here you can find course
              materials, laboratory guidance, notices, and information about project and research supervision.
            </p>
            <div className="mt-8 grid max-w-[340px] gap-3 sm:max-w-none sm:grid-cols-2">
              <Link className="btn btn-primary" href="/subjects">
                <GraduationCap size={18} />
                Browse course resources
              </Link>
              <a className="btn btn-secondary" href="#academic-roadmap">
                <Layers3 size={18} />
                View the study path
              </a>
              <a className="btn btn-ghost" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                <Linkedin size={18} />
                Connect on LinkedIn
              </a>
              <Link className="btn btn-gold" href="/contact?purpose=Training">
                <Handshake size={18} />
                Training and collaboration
              </Link>
            </div>
          </div>

          <aside className="hidden lg:grid gap-4">
            <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-line bg-white shadow-premium">
              <img
                src={profilePhoto}
                alt="Er. Arjun Neupane"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101b28]/95 via-[#101b28]/70 to-transparent p-6 text-white">
                <p className="mb-2 text-xs font-extrabold uppercase tracking-normal text-white/75">Academic profile</p>
                <h3 className="text-2xl font-extrabold">Er. Arjun Neupane</h3>
                <p className="mt-3 max-w-md text-white/90">{profile.headline}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white/82">
                  <MapPin size={17} />
                  {profile.location}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 rounded-lg border border-line bg-white/90 p-5 shadow-premium">
              <Proof value="3" label="Degree programs" />
              <Proof value="4" label="Teaching affiliations" />
              <Proof value="4" label="Resource categories" />
            </div>
          </aside>
        </div>
      </section>

      <section className="relative z-20 -mt-3">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-lg border border-line bg-white shadow-soft md:grid-cols-4">
            <Trust title="BCA, BSc CSIT, and BE" body="Course materials arranged by program" />
            <Trust title="Laboratory and assignment work" body="Instructions and supporting materials" />
            <Trust title="Research supervision" body="Advice on proposals, theses, and papers" />
            <Trust title="Kathmandu, Nepal" body="Teaching across four academic institutions" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Where I teach</p>
              <h2 className="h2">My current academic roles in Kathmandu.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                At these institutions, I teach computing subjects and supervise practical coursework, student projects,
                and research. The roles below reflect my current academic affiliations.
              </p>
            </div>
            <a className="btn btn-secondary" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
              <Linkedin size={18} />
              LinkedIn profile
              <ExternalLink size={16} />
            </a>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {profile.currentRoles.map((role) => (
              <RoleCard key={role.institution} {...role} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[0.95fr_0.7fr]">
          <div>
            <p className="eyebrow">Teaching approach</p>
            <h2 className="h2">Connecting clear explanations with practical work.</h2>
            <p className="mt-5 text-muted">
              My background spans electrical and electronic engineering, communication systems, and applied computing.
              I teach BCA, BSc CSIT, and BE Computer Engineering students through lectures, labs, assignments, and
              supervised projects.
            </p>
            <ul className="mt-6 grid gap-4">
              <Feature icon={GraduationCap}>{profile.backgroundHighlights[0]}</Feature>
              <Feature icon={Presentation}>I teach programming, networking, systems, research, and project-based courses.</Feature>
              <Feature icon={Microscope}>My research interests include quantum computing, AI, networking, cybersecurity, IoT, and software systems.</Feature>
              <Feature icon={UsersRound}>I mentor students working on projects, internship reports, and research papers.</Feature>
            </ul>
          </div>
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="eyebrow">How I teach</p>
            <h3 className="text-xl font-bold text-ink">Understand the idea, practise the method, and explain the result.</h3>
            <p className="mt-3 text-muted">
              I organise these materials by program and semester so you can connect each concept with its laboratory,
              assessment, and research context.
            </p>
            <div className="mt-6 border-t border-line pt-6">
              <strong className="block font-serif text-2xl text-navy">Er. Arjun Neupane</strong>
              <span className="text-muted">Computer engineer, lecturer, researcher, and academic mentor</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-band" id="academic-roadmap">
        <div className="site-container">
          <SectionHead
            eyebrow="Course resources by program"
            title="Start with your program, then choose the semester and subject."
            body="Resources are kept separate for BSc CSIT, BCA, and BE Computer Engineering. Each subject page groups course notes, assignments, practical or research work, and past questions."
            href="/subjects"
            action="View all programs"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {academicPrograms.map((program) => <ProgramCard program={program} key={program.slug} />)}
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-4">
            <RoadmapStep number={1} title="Program" body="Choose BSc CSIT, BCA, or BE Computer Engineering." />
            <RoadmapStep number={2} title="Semester" body="Select Semester 1 through Semester 8." />
            <RoadmapStep number={3} title="Subject" body="Open the subject listed under your program." />
            <RoadmapStep number={4} title="Resources" body="Find notes, assignments, practical or research work, and past questions." final />
          </div>
        </div>
      </section>

      <section className="section bg-gradient-to-b from-teal/10 to-[#faf7f0]/40">
        <div className="site-container grid gap-5 md:grid-cols-3">
          <HomePath icon={ClipboardCheck} title="Grades and feedback" href="/grading">
            View published assessment results and teacher feedback through the private grading portal.
          </HomePath>
          <HomePath icon={Megaphone} title="Notices and deadlines" href="/notices" tone="gold">
            Find class announcements, submission deadlines, exam updates, workshop dates, and research opportunities.
          </HomePath>
          <HomePath icon={Microscope} title="Research and student projects" href="/research" tone="plum">
            Read about my research interests and the support available for proposals, papers, and student projects.
          </HomePath>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHead eyebrow="Workshops and training" title="Workshops for students, project teams, and academic departments." href="/workshops" action="View workshops" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.title} {...workshop} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[0.95fr_0.7fr]">
          <div>
            <p className="eyebrow">Work with me</p>
            <h2 className="h2">Discuss a workshop, student project, or research collaboration.</h2>
            <p className="mt-5 text-muted">
              I welcome enquiries from colleges, academic teams, and students. Tell me about the course, project, or
              research activity you have in mind, and I will respond with the relevant details.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="btn btn-primary" href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={18} /> Connect on LinkedIn</a>
              <Link className="btn btn-secondary" href="/contact?purpose=Collaboration"><Mail size={18} /> Contact for collaboration</Link>
            </div>
          </div>
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="eyebrow">At a glance</p>
            <h3 className="text-2xl font-bold">Er. Arjun Neupane</h3>
            <p className="mt-2 text-muted">{profile.headline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[...profile.currentRoles.map((role) => role.institution), "Student supervision", "Course resources"].map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHead eyebrow="Study-guide topics" title="Questions from coursework, projects, and research." href="/blog" action="View topics" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article className="card grid min-h-[250px]" key={post.title}>
                <div>
                  <div className="mb-3 text-sm font-extrabold text-gold">{post.category}</div>
                  <h3 className="mb-2 text-xl font-bold text-ink">{post.title}</h3>
                  <p className="text-muted">{post.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <strong className="block text-2xl leading-none text-navy">{value}</strong>
      <span className="mt-2 block text-xs text-muted">{label}</span>
    </div>
  );
}

function Trust({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-b border-line p-6 md:border-b-0 md:border-r md:last:border-r-0">
      <strong className="block text-lg text-navy">{title}</strong>
      <span className="mt-1 block text-sm text-muted">{body}</span>
    </div>
  );
}

function Feature({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[24px_1fr] gap-3 text-slate-700">
      <Icon className="mt-1 text-teal-deep" size={20} />
      <span>{children}</span>
    </li>
  );
}

function RoleCard({
  institution,
  role,
  focus
}: {
  institution: string;
  role: string;
  focus: string;
}) {
  return (
    <article className="card">
      <span className="icon-box">
        <Building2 size={22} />
      </span>
      <h3 className="mb-2 text-xl font-bold text-ink">{institution}</h3>
      <p className="mb-3 text-sm font-extrabold text-teal-deep">{role}</p>
      <p className="text-muted">{focus}</p>
    </article>
  );
}

function SectionHead({
  eyebrow,
  title,
  body,
  href,
  action,
  icon: Icon = ArrowUpRight
}: {
  eyebrow: string;
  title: string;
  body?: string;
  href: string;
  action: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h2">{title}</h2>
        {body ? <p className="mt-4 max-w-3xl text-muted">{body}</p> : null}
      </div>
      <Link className="btn btn-secondary" href={href}>
        <Icon size={18} />
        {action}
      </Link>
    </div>
  );
}

function HomePath({
  icon: Icon,
  title,
  children,
  href,
  tone = "teal"
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  href: string;
  tone?: "teal" | "gold" | "plum";
}) {
  const toneClass = tone === "gold" ? "bg-[#fff4dc] text-[#765019]" : tone === "plum" ? "bg-[#f8eaf0] text-plum" : "";
  return (
    <article className="card">
      <span className={`icon-box ${toneClass}`}>
        <Icon size={22} />
      </span>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="mb-5 text-muted">{children}</p>
      <Link className="btn btn-secondary" href={href}>
        <ArrowUpRight size={18} />
        Open
      </Link>
    </article>
  );
}
