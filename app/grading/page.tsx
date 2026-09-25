import Link from "next/link";
export default function Page() {
  return (
    <main id="main-content" className="site-container py-16">
      <p className="eyebrow">Assessment information</p>
      <h1 className="h2">Coursework and assessment</h1>
      <p className="my-5 text-muted">
        Published assignment briefs and practice materials are available in the
        course collection. For individual grades or feedback, contact your
        instructor.
      </p>
      <Link href="/courses" className="btn btn-primary">
        Browse courses
      </Link>
    </main>
  );
}
