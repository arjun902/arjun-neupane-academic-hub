import Link from "next/link";
import { profile } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="bg-[#101b28] py-12 text-white/75 md:py-14">
      <div className="site-container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr]">
          <div>
            <h3 className="mb-3 text-xl font-bold text-white">Er. Arjun Neupane</h3>
            <p className="max-w-md text-sm">
              Computer Engineer, Lecturer, Researcher, and Academic Mentor serving BCA, CSIT, and BE students.
            </p>
          </div>
          <FooterGroup title="Platform" links={[["Subjects", "/subjects"], ["Materials", "/materials"], ["Grading", "/grading"]]} />
          <FooterGroup title="Academic" links={[["Research", "/research"], ["Workshops", "/workshops"], ["Blog", "/blog"]]} />
          <FooterGroup title="Contact" links={[["LinkedIn", profile.linkedinUrl], ["[ADD EMAIL HERE]", "/contact"], ["Kathmandu, Nepal", "/contact"]]} />
        </div>
        <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/55">
          &copy; 2026 Er. Arjun Neupane. Built as a fast, responsive academic web platform.
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <strong className="text-white">{title}</strong>
      <div className="mt-2 grid gap-2 text-sm">
        {links.map(([label, href]) =>
          href.startsWith("http") ? (
            <a className="text-white/75 hover:text-white" href={href} key={label} target="_blank" rel="noreferrer">
              {label}
            </a>
          ) : (
            <Link className="text-white/75 hover:text-white" href={href} key={label}>
              {label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
