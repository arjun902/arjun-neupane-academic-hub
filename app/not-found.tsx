import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="site-container py-20">
      <p className="eyebrow">404 / Page not found</p>
      <h1 className="h1">Let’s find your course.</h1>
      <p className="lead my-6">
        This address is unavailable. Browse the course collection to find your
        learning materials.
      </p>
      <Link href="/courses" className="btn btn-primary">
        Explore courses
      </Link>
    </main>
  );
}
