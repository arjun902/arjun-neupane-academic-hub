import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { notices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Notices and Announcements",
  description: "Latest class updates, assignment deadlines, lab notices, exam preparation notices, workshop announcements, project defense schedules and research opportunities."
};

export default function NoticesPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Notices" title="Notices and Announcements">
        Latest class updates, assignment deadlines, lab submission notices, exam preparation notices, workshops, project
        defenses, internship deadlines, and research opportunities.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Notice board</p>
              <h2 className="h2">Clear academic updates for students and coordinators.</h2>
            </div>
            <Link className="btn btn-secondary" href="/contact"><Send size={18} /> Ask a question</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {notices.map((notice) => (
              <article className={`card border-l-4 ${notice.tone === "plum" ? "border-l-plum" : "border-l-teal"}`} key={notice.title}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="tag">{notice.type}</span>
                  <time className="text-sm font-bold text-muted" dateTime={notice.date}>{notice.date}</time>
                </div>
                <h3 className="mb-2 text-xl font-bold">{notice.title}</h3>
                <p className="text-muted">{notice.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
