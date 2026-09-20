import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { notices } from "@/lib/data";

const noticeDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC"
});

export const metadata: Metadata = {
  title: "Notices and Announcements",
  description: "Published course notices, submission deadlines, examination updates, workshop dates, and research opportunities."
};

export default function NoticesPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Notices" title="Notices and Announcements">
        Review published course notices, submission deadlines, examination updates, workshop dates, and research opportunities.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Course notice board</p>
              <h2 className="h2">Published updates for students and coordinators.</h2>
            </div>
            <Link className="btn btn-secondary" href="/contact?purpose=Student%20Support"><Send size={18} /> Ask about a notice</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {notices.map((notice) => (
              <article className={`card border-l-4 ${notice.tone === "plum" ? "border-l-plum" : "border-l-teal"}`} key={notice.title}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="tag">{notice.type}</span>
                  <time className="text-sm font-bold text-muted" dateTime={notice.date}>
                    {noticeDateFormatter.format(new Date(`${notice.date}T00:00:00Z`))}
                  </time>
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
