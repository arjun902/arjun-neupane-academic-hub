import Link from "next/link";
import { profile } from "@/lib/data";

export function SiteFooter() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return (
    <footer className="bg-[#101b28] py-12 text-white/75 md:py-14">
      <div className="site-container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr]">
          <div>
            <h3 className="mb-3 text-xl font-bold text-white">Er. Arjun Neupane</h3>
            <p className="max-w-md text-sm">
              I teach computing and computer engineering and supervise student projects and research.
            </p>
          </div>
          <FooterGroup title="For students" links={[["Programs and Subjects", "/subjects"], ["Student Dashboard", "/student"], ["Grading", "/grading"]]} />
          <FooterGroup title="Explore" links={[["Research", "/research"], ["Workshops", "/workshops"], ["Articles", "/blog"]]} />
          <FooterGroup title="Contact" links={[["LinkedIn", profile.linkedinUrl], ["GitHub", profile.githubUrl], [contactEmail || "Contact form", contactEmail ? `mailto:${contactEmail}` : "/contact"], ["Kathmandu, Nepal", "/contact"]]} />
        </div>
        <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/55">
          &copy; 2026 Er. Arjun Neupane.
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
          ) : href.startsWith("mailto:") ? (
            <a className="text-white/75 hover:text-white" href={href} key={label}>{label}</a>
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
