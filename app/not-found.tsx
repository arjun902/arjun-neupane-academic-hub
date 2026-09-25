import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="site-container section">
      <p className="eyebrow">404 · Page not found</p>
      <h1>Let’s find your way back.</h1>
      <p className="lead">
        This page may have moved as the academic collections were reorganised.
      </p>
      <div className="actions">
        <Link className="btn btn-primary" href="/teaching">
          Browse teaching
        </Link>
        <Link className="btn btn-secondary" href="/resources">
          Search resources
        </Link>
        <Link className="text-link" href="/">
          Home →
        </Link>
      </div>
    </main>
  );
}
