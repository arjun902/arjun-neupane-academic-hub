import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ClipboardCheck, Megaphone, UploadCloud, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminActivityTable } from "@/components/dashboard-tables";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard concept for uploading notes, managing subjects, assignments, grading, notices, workshops, blog posts, download analytics and student engagement."
};

export default function AdminPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Admin Dashboard" title="Admin Dashboard">
        A clean academic operations surface for uploading resources, grading students, publishing notices, managing
        workshops, writing blog posts, and monitoring engagement.
      </PageHero>
      <section className="section">
        <div className="site-container grid gap-6 lg:grid-cols-[260px_1fr]">
          <DashboardSidebar items={["Overview", "Upload notes and PDFs", "Update grading", "Post notices", "Manage students", "Analytics"]} />
          <div>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Metric value="128" label="Published resources" />
              <Metric value="42" label="Students pending feedback" />
              <Metric value="18k" label="Monthly downloads" />
              <Metric value="9" label="Active subjects" />
            </div>
            <section className="rounded-lg border border-line bg-white p-6 shadow-premium">
              <div className="mb-6 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <p className="eyebrow">Resource operations</p>
                  <h2 className="h2">Upload and manage academic materials.</h2>
                </div>
                <button className="btn btn-primary" type="button"><UploadCloud size={18} /> Upload material</button>
              </div>
              <AdminActivityTable />
            </section>
            <section className="section">
              <div className="grid gap-5 md:grid-cols-3">
                <Action icon={ClipboardCheck} title="Update grading">Subject-wise marks, lab evaluation, viva scores, internal progress, and individual remarks.</Action>
                <Action icon={Megaphone} title="Post notices" tone="gold">Publish assignment deadlines, lab submission notices, exam preparation updates, and workshop alerts.</Action>
                <Action icon={BarChart3} title="View analytics" tone="plum">Track download analytics, student engagement, popular materials, and resource gaps.</Action>
              </div>
            </section>
            <section className="rounded-lg border border-line bg-white p-6 shadow-premium">
              <p className="eyebrow">Management scope</p>
              <h2 className="h2">Subjects, students, workshops, blog posts, and backups.</h2>
              <p className="mt-4 text-muted">
                Designed for a Supabase backend with authentication, file storage, database tables, scheduled backups,
                and analytics integration.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link className="btn btn-secondary" href="/student"><UserRound size={18} /> Student view</Link>
                <Link className="btn btn-secondary" href="/contact">Backend setup request</Link>
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
