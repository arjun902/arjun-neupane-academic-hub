"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function PublicRedirect({ to = "/courses" }: { to?: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return (
    <main id="main-content" className="site-container py-16">
      <h1 className="h2">Learning resources are open to everyone.</h1>
      <p className="my-4">No account or password is needed.</p>
      <Link href={to} className="btn btn-primary">
        Explore courses →
      </Link>
    </main>
  );
}
