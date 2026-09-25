import Link from "next/link";
import { Catalogue, PublicAnnouncements } from "@/components/catalogue";
export default function Home() {
  return (
    <main id="main-content">
      <section className="border-b border-line bg-[#f3f1eb] py-12 md:py-16">
        <div className="site-container grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="eyebrow">TU BCA & BSc CSIT · Learning resources</p>
            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-navy md:text-5xl">
              Build understanding.
              <br />
              One course at a time.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              A focused home for your notes, practical work, and revision
              materials, organised by Er. Arjun Neupane.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link className="btn btn-primary" href="/courses">
                Access My Courses
              </Link>
              <Link className="btn btn-secondary" href="/instructor-login">
                Instructor Login
              </Link>
            </div>
          </div>
          <aside className="self-center border-l-2 border-teal pl-6">
            <p className="eyebrow">Your learning space</p>
            <h2 className="text-xl font-bold text-navy">
              Prepared for the classroom.
              <br />
              Available beyond it.
            </h2>
            <p className="mt-3 text-sm text-muted">
              Find your course resources, save what matters, and pick up where
              you left off.
            </p>
          </aside>
        </div>
      </section>
      <Catalogue />
      <section className="border-y border-line bg-white py-12">
        <div className="site-container grid gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">Your instructor</p>
            <h2 className="h2">Er. Arjun Neupane</h2>
            <p className="mt-4 text-muted">
              Computer engineer and educator supporting students through
              computing courses, laboratory work, and projects.
            </p>
            <Link
              href="/about"
              className="mt-4 inline-block font-bold text-teal-deep"
            >
              About the Instructor →
            </Link>
          </div>
          <div>
            <p className="eyebrow">Getting started</p>
            <h2 className="text-2xl font-bold text-navy">
              Choose. Unlock. Learn.
            </h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted">
              <li>Select your course from the catalogue.</li>
              <li>Enter the course password provided by your instructor.</li>
              <li>
                Open the published notes, practical work and revision materials.
              </li>
            </ol>
            <p className="mt-4 text-sm text-muted">
              No registration or email is needed. Need the course password?
              Contact your instructor directly.
            </p>
          </div>
        </div>
      </section>
      <PublicAnnouncements />
    </main>
  );
}
