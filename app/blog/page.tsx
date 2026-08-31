import type { Metadata } from "next";
import Link from "next/link";
import { FileDown, Link as LinkIcon, ListTree, Tags } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { posts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Study Guides and Article Topics",
  description: "Study-guide topics in programming, computer networks, research methods, project work, AI, and quantum computing."
};

export default function BlogPage() {
  return (
    <main>
      <PageHero breadcrumb="Home / Blog" title="Study Guides and Article Topics">
        Browse topics drawn from course concepts, project planning, academic writing, AI, and quantum computing.
      </PageHero>
      <section className="section">
        <div className="site-container">
          <div className="mb-8 grid items-end gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="eyebrow">Topic library</p>
              <h2 className="h2">Questions worth exploring beyond the classroom.</h2>
              <p className="mt-4 max-w-3xl text-muted">
                Each topic begins with a question students commonly encounter in coursework, laboratories, projects, or
                academic writing. Use the summaries to choose what to explore next.
              </p>
            </div>
            <Link className="btn btn-secondary" href="/subjects"><LinkIcon size={18} /> Browse subject resources</Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article className="card grid min-h-[250px]" key={post.title}>
                <div>
                  <div className="mb-3 text-sm font-extrabold text-gold">{post.category}</div>
                  <h3 className="mb-2 text-xl font-bold">{post.title}</h3>
                  <p className="text-muted">{post.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-band">
        <div className="site-container grid items-start gap-10 lg:grid-cols-[0.9fr_0.7fr]">
          <div>
            <p className="eyebrow">Topics covered</p>
            <h2 className="h2">Coursework, projects, and research.</h2>
            <p className="mt-5 text-muted">
              Topics include programming, computer networks, numerical methods, internship reports, project proposals,
              artificial intelligence, and quantum computing.
            </p>
          </div>
          <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <h3 className="mb-4 text-xl font-bold">How to use these topics</h3>
            <ul className="grid gap-4">
              <li className="flex gap-3 text-slate-700"><Tags className="text-teal-deep" size={20} /> Choose a topic that matches your current subject or assignment.</li>
              <li className="flex gap-3 text-slate-700"><ListTree className="text-teal-deep" size={20} /> Follow the explanation from the main idea to its practical use.</li>
              <li className="flex gap-3 text-slate-700"><FileDown className="text-teal-deep" size={20} /> Open the related course resources when you need more practice.</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
