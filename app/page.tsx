import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  Handshake,
  Layers3,
  LibraryBig,
  Linkedin,
  Mail,
  MapPin,
  Megaphone,
  Microscope,
  Presentation,
  Search,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SubjectCard, WorkshopCard } from "@/components/cards";
import { ResourceHub } from "@/components/resource-hub";
import { posts, profile, subjects, workshops } from "@/lib/data";

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
              <p className="eyebrow mb-0">Computer Engineering | Higher Education | Applied Technology</p>
              <span className="rounded-full border border-[#efd8ae] bg-[#fff7e8] px-3 py-1.5 text-xs font-extrabold text-[#7b561c]">
                MSc ICE
              </span>
            </div>
            <h1 className="h1 break-words">Er. Arjun Neupane</h1>
            <p className="mt-5 max-w-[320px] break-words font-extrabold text-teal-deep sm:max-w-none">Computer Engineer | Lecturer | Researcher | Academic Mentor</p>
            <p className="lead mt-5 max-w-[340px] break-words sm:max-w-none">
              Empowering BCA, CSIT, and BE students through structured learning materials, practical labs, research
              guidance, and technology-focused mentorship across Kathmandu's academic institutions.
            </p>
            <div className="mt-8 grid max-w-[340px] gap-3 sm:max-w-none sm:grid-cols-2">
              <Link className="btn btn-primary" href="/materials">
                <LibraryBig size={18} />
                View Study Materials
              </Link>
              <Link className="btn btn-secondary" href="/subjects">
                <Layers3 size={18} />
                Explore Subjects
              </Link>
              <a className="btn btn-ghost" href={profile.linkedinUrl} target="_blank" rel="noreferrer">
                <Linkedin size={18} />
                Connect on LinkedIn
              </a>
              <Link className="btn btn-gold" href="/contact">
                <Handshake size={18} />
                Training / Collaboration
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
              <Proof value="16+" label="Subjects and tracks" />
              <Proof value="4" label="Current institutions" />
              <Proof value="24/7" label="Resource access" />
            </div>
          </aside>
        </div>
      </section>

      <section className="relative z-20 -mt-3">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-lg border border-line bg-white shadow-soft md:grid-cols-4">
            <Trust title="BCA, CSIT, BE" body="Program-aware learning paths" />
            <Trust title="Labs + Assignments" body="Practice-focused course support" />
            <Trust title="Research Mentoring" body="Proposal, thesis, and paper guidance" />
            <Trust title="Kathmandu, Nepal" body="KMC, NCCS, KBC, and Ambition Academy" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Current academic roles</p>
              <h2 className="h2">Teaching, mentoring, and academic support across Kathmandu.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                The public LinkedIn profile and current professional details position Arjun as an engineer, assistant
                professor, lecturer, researcher, and academic mentor active across multiple colleges and programs.
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
            <p className="eyebrow">About the educator</p>
            <h2 className="h2">Premium academic identity with a practical technology backbone.</h2>
            <p className="mt-5 text-muted">
              {profile.summary}
            </p>
            <ul className="mt-6 grid gap-4">
              <Feature icon={GraduationCap}>{profile.backgroundHighlights[0]}</Feature>
              <Feature icon={Presentation}>Lecturer for programming, networking, systems, research, and project-based courses.</Feature>
              <Feature icon={Microscope}>Research interests in Quantum Computing, AI, Networking, Cybersecurity, IoT, and Software Systems.</Feature>
              <Feature icon={UsersRound}>Academic mentor for projects, internship reports, workshops, research papers, and publication support.</Feature>
            </ul>
          </div>
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="eyebrow">Academic positioning</p>
            <h3 className="text-xl font-bold text-ink">Teaching Technology with Clarity, Practice, and Research Orientation.</h3>
            <p className="mt-3 text-muted">
              The website is structured for high-traffic student discovery while still presenting a polished profile
              for colleges, coordinators, and research collaborators.
            </p>
            <div className="mt-6 border-t border-line pt-6">
              <strong className="block font-serif text-2xl text-navy">Er. Arjun Neupane</strong>
              <span className="text-muted">Assistant Professor, lecturer, researcher, and mentor</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section-band">
        <div className="site-container">
          <SectionHead
            eyebrow="Subjects I teach"
            title="Course cards built for quick scanning and deeper study."
            body="Students can move from a subject overview into unit-wise notes, labs, assignments, question banks, viva questions, and project guidance."
            href="/subjects"
            action="View all subjects"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {subjects.slice(0, 9).map((subject) => (
              <SubjectCard subject={subject} featured key={subject.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHead
            eyebrow="Student Resource Hub"
            title="A resource platform, not a file dump."
            body="Filter study materials by program, semester, subject, and material type. The structure is ready for Supabase upload and analytics workflows."
            href="/materials"
            action="Explore materials"
            icon={Search}
          />
          <ResourceHub />
        </div>
      </section>

      <section className="section bg-gradient-to-b from-teal/10 to-[#faf7f0]/40">
        <div className="site-container grid gap-5 md:grid-cols-3">
          <HomePath icon={ClipboardCheck} title="Grading and academic updates" href="/grading">
            Assignment status, lab performance, viva marks, internal assessment progress, attendance, feedback, and pending submissions.
          </HomePath>
          <HomePath icon={Megaphone} title="Notices and announcements" href="/notices" tone="gold">
            Class updates, deadlines, lab submissions, exams, project defense schedules, workshops, and research opportunities.
          </HomePath>
          <HomePath icon={Microscope} title="Research and projects" href="/research" tone="plum">
            Quantum Computing, AI, Cybersecurity, Computer Networks, IoT Systems, academic tools, and supervised student projects.
          </HomePath>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHead eyebrow="Workshops and training" title="Focused academic training for classrooms, projects, and professional readiness." href="/workshops" action="View workshops" />
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
            <p className="eyebrow">LinkedIn and collaboration</p>
            <h2 className="h2">Academic collaboration, training, research, and mentoring.</h2>
            <p className="mt-5 text-muted">
              Connect for workshops, classroom resource systems, student project supervision, research collaboration,
              publication guidance, and college training invitations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a className="btn btn-primary" href={profile.linkedinUrl} target="_blank" rel="noreferrer"><Linkedin size={18} /> Connect on LinkedIn</a>
              <Link className="btn btn-secondary" href="/contact"><Mail size={18} /> Contact for collaboration</Link>
            </div>
          </div>
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <p className="eyebrow">Professional card</p>
            <h3 className="text-2xl font-bold">Er. Arjun Neupane</h3>
            <p className="mt-2 text-muted">{profile.headline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[...profile.currentRoles.map((role) => role.institution), "Research work", "Academic resources"].map((tag) => (
                <span className="tag" key={tag}>{tag}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <SectionHead eyebrow="Blog and learning articles" title="SEO-ready content for students searching with real academic intent." href="/blog" action="Read articles" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article className="card grid min-h-[250px]" key={post.title}>
                <div>
                  <div className="mb-3 text-sm font-extrabold text-gold">{post.category}</div>
                  <h3 className="mb-2 text-xl font-bold text-ink">{post.title}</h3>
                  <p className="text-muted">{post.description}</p>
                </div>
                <div className="self-end text-sm font-bold text-muted">{post.read}</div>
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
