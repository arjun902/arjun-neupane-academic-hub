import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, FileSpreadsheet, LayoutDashboard, LockKeyhole, ShieldCheck } from "lucide-react";
import { IconCard } from "@/components/cards";
import { GradingTable } from "@/components/dashboard-tables";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Grading Portal",
  description: "Private grading portal concept for assignment status, lab performance, viva marks, internal assessment progress, attendance and teacher feedback."
};

export default function GradingPage() {
  return (
    <main>
      <PageHero
        breadcrumb="Home / Grading"
        title="Grading and Academic Updates"
        actions={
          <>
            <Link className="btn btn-primary" href="/login"><ShieldCheck size={18} /> Student login</Link>
            <Link className="btn btn-secondary" href="/admin"><LayoutDashboard size={18} /> Admin dashboard</Link>
          </>
        }
      >
        A private student-facing portal for assignment status, lab performance, viva marks, internal progress, attendance
        summary, remarks, and pending submission notices.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Metric value="RBAC" label="Admin / Teacher / Student roles" />
            <Metric value="PDF" label="Export-ready assessment reports" />
            <Metric value="XLS" label="Excel-friendly grade sheets" />
            <Metric value="1:1" label="Individual feedback workflow" />
          </div>
          <GradingTable />
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid gap-5 md:grid-cols-3">
          <IconCard icon={LockKeyhole} title="Private by default">
            Student marks, attendance, remarks, and feedback belong behind authenticated role-based access.
          </IconCard>
          <IconCard icon={FileSpreadsheet} title="Teacher workflow" tone="gold">
            Subject-wise grading, bulk upload, exports, feedback notes, and pending-submission announcements.
          </IconCard>
          <IconCard icon={BellRing} title="Student alerts" tone="plum">
            Students can see missing labs, resubmission notes, viva status, and project evaluation progress.
          </IconCard>
        </div>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <strong className="block text-2xl leading-none text-navy">{value}</strong>
      <span className="mt-2 block text-sm font-bold text-muted">{label}</span>
    </div>
  );
}
