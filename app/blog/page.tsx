import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, Link as LinkIcon, ListTree, Tags } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { posts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog and Learning Articles",
  description: "SEO-ready academic articles on programming tutorials, BCA notes, CSIT notes, BE engineering notes, research guidance, project ideas, AI, quantum computing, networking and cybersecurity."
};

export default function BlogPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Blog" title="Blog and Learning Articles">
        Programming tutorials, BCA notes, CSIT notes, BE engineering notes, research guidance, project ideas, internship
        report writing, AI, quantum computing, networking, cybersecurity, and IT career guidance.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Learning content</p>
              <h2 className="h2">Built for organic discovery and useful student reading.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                Article templates are ready for meta titles, descriptions, keywords, table of contents, internal links,
                and downloadable resources.
              </p>
            </div>
            <Link className="btn btn-secondary" href="/materials"><LinkIcon size={18} /> Link to resources</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article className="card grid min-h-[250px]" key={post.title}>
                <div>
                  <div className="mb-3 text-sm font-extrabold text-gold">{post.category}</div>
                  <h3 className="mb-2 text-xl font-bold">{post.title}</h3>
                  <p className="text-muted">{post.description}</p>
                </div>
                <div className="self-end text-sm font-bold text-muted">{post.read}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid items-start gap-10 lg:grid-cols-[0.9fr_0.7fr]">
          <div>
            <p className="eyebrow">SEO categories</p>
            <h2 className="h2">Search terms aligned with student intent.</h2>
            <p className="mt-5 text-muted">
              BCA Notes Nepal, CSIT Notes Nepal, BE Computer Engineering Notes, Numerical Methods Notes, Computer
              Networking Notes, Java Programming Notes, C Programming Lab Report, BCA Project Ideas, Internship Report
              Format, and CSIT Study Materials.
            </p>
          </div>
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-xl font-bold">Article structure</h3>
            <ul className="grid gap-4">
              <li className="flex gap-3 text-slate-700"><Tags className="text-teal-deep" size={20} /> Meta title, meta description, keywords, and Open Graph support.</li>
              <li className="flex gap-3 text-slate-700"><ListTree className="text-teal-deep" size={20} /> Table of contents and internal links to subjects, downloads, and notices.</li>
              <li className="flex gap-3 text-slate-700"><FileDown className="text-teal-deep" size={20} /> Downloadable resources attached where useful.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
