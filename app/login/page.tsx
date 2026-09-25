import Link from "next/link";
import { Catalogue } from "@/components/catalogue";
export default function AccessCourses() {
  return (
    <main id="main-content">
      <section className="site-container pt-10">
        <p className="eyebrow">Access My Courses</p>
        <h1 className="h2">Your courses, one password away.</h1>
        <p className="mt-4 text-muted">
          Select your course below and use the course password provided by your
          instructor. No student account, email or email verification is required.
        </p>
        <Link
          href="/instructor-login"
          className="mt-4 inline-block font-bold text-teal-deep underline"
        >
          Instructor Login →
        </Link>
      </section>
      <Catalogue />
    </main>
  );
}
