import type { Metadata } from "next";
import { Download, HelpCircle, MessageSquareText, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StudentSubjectsTable } from "@/components/dashboard-tables";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Student dashboard concept for selecting program and semester, viewing subjects, downloading notes, submitting assignments, checking grades, reading feedback and accessing notices."
};

export default function StudentPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Student Dashboard" title="Student Dashboard">
        Access enrolled subjects, download notes, submit assignments, check grading updates, read teacher feedback, view
        notices, and ask academic queries.
      </PageHero>
      <section className="section">
        <div className="site-container grid gap-6 lg:grid-cols-[260px_1fr]">
          <DashboardSidebar items={["Overview", "Enrolled subjects", "Downloads", "Assignments", "Feedback", "Academic query"]} />
          <div>
            <div className="mb-6 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-4">
              <Select label="Program" options={["BCA", "CSIT", "BE"]} />
              <Select label="Semester" options={["1st", "2nd", "3rd", "4th", "5th", "8th", "Final"]} />
              <Select label="Subject" options={["Computer Networking", "Java Programming", "DBMS", "Project Work"]} />
              <Select label="Quick view" options={["Materials", "Grades", "Notices", "Feedback"]} />
            </div>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Metric value="5" label="Enrolled subjects" />
              <Metric value="14" label="New downloads" />
              <Metric value="2" label="Pending submissions" />
              <Metric value="86%" label="Attendance summary" />
            </div>
            <section className="rounded-lg border border-line bg-white p-6 shadow-premium">
              <div className="mb-6">
                <p className="eyebrow">Current academic status</p>
                <h2 className="h2">Subjects, materials, and feedback in one view.</h2>
              </div>
              <StudentSubjectsTable />
            </section>
            <section className="section">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Action icon={Download} title="Download library">Access notes, slides, lab sheets, question banks, solutions, and project guidelines.</Action>
                <Action icon={Upload} title="Submit assignments" tone="gold">Upload lab reports, programming assignments, project drafts, and internship documents.</Action>
                <Action icon={MessageSquareText} title="Teacher feedback" tone="plum">Read remarks, requested corrections, viva notes, and project improvement points.</Action>
                <Action icon={HelpCircle} title="Academic queries">Ask questions about notes, grading, projects, internships, and research direction.</Action>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardSidebar({ items }: { items: string[] }) {
  return (
    <aside className="self-start rounded-lg bg-navy p-4 text-white lg:sticky lg:top-24">
      {items.map((item, index) => (
        <a className={`block rounded-lg px-3 py-3 text-sm font-bold ${index === 0 ? "bg-white/12 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`} href="#" key={item}>
          {item}
        </a>
      ))}
    </aside>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-slate-700">
      {label}
      <select className="form-input">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <strong className="block text-3xl leading-none text-navy">{value}</strong>
      <span className="mt-2 block text-sm font-bold text-muted">{label}</span>
    </div>
  );
}

function Action({ icon: Icon, title, children, tone = "teal" }: { icon: LucideIcon; title: string; children: React.ReactNode; tone?: "teal" | "gold" | "plum" }) {
  const toneClass = tone === "gold" ? "bg-[#fff4dc] text-[#765019]" : tone === "plum" ? "bg-[#f8eaf0] text-plum" : "";
  return (
    <article className="card">
      <span className={`icon-box ${toneClass}`}><Icon size={22} /></span>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted">{children}</p>
    </article>
  );
}
