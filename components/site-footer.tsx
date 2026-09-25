import Link from "next/link";
import { profile } from "@/content/profile";
export function SiteFooter() {
  return (
    <footer className="academic-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <strong className="font-serif text-2xl">Arjun Neupane</strong>
            <p className="mt-3">
              Teaching, inquiry and practical learning in computer science and
              engineering.
            </p>
          </div>
          <div>
            <h2>Teaching</h2>
            <Link href="/teaching">Programs & semesters</Link>
            <Link href="/resources">Find resources</Link>
            <Link href="/students">Student guidance</Link>
            <Link href="/notices">Academic notices</Link>
          </div>
          <div>
            <h2>Scholarship</h2>
            <Link href="/research">Research interests</Link>
            <Link href="/research#projects">Projects & supervision</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/activities">Activities</Link>
          </div>
          <div>
            <h2>Connect</h2>
            <Link href="/profile">Academic profile</Link>
            <Link href="/contact">Contact</Link>
            {profile.links.map((l) => (
              <a key={l.url} href={l.url}>
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Arjun Neupane.</p>
          <p>
            Independent academic and teaching resource. Not an official
            Tribhuvan University website or endorsement.
          </p>
        </div>
      </div>
    </footer>
  );
}
