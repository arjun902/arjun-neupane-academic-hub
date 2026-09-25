import Link from "next/link";
import { profile } from "@/lib/data";
export const metadata = { title: "About the Instructor" };
export default function About() {
  return (
    <main id="main-content" className="site-container py-12">
      <div className="grid items-start gap-10 md:grid-cols-[1fr_280px]">
        <section>
          <p className="eyebrow">About the Instructor</p>
          <h1 className="h2">Er. Arjun Neupane</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{profile.summary}</p>
          <p className="mt-4 text-muted">
            This academic hub brings course materials into one organised space
            for TU BCA and BSc CSIT students. Published teaching resources are
            open to everyone without an account.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/courses">
              Explore Courses
            </Link>
            <a
              className="btn btn-secondary"
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
            <Link className="btn btn-secondary" href="/contact">
              Contact
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted">
            An independent teaching resource. No official TU affiliation or
            endorsement is implied.
          </p>
        </section>
        <img
          className="w-full max-w-[280px] rounded-lg border border-line object-cover"
          src={(process.env.NEXT_PUBLIC_BASE_PATH || "") + profile.photo}
          alt="Er. Arjun Neupane"
        />
      </div>
    </main>
  );
}
