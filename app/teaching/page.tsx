import Link from "next/link";
import { programmes, catalogNotice } from "@/content/programmes";
import { PageShell, ProgrammeCard } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Teaching",
  "Explore open course resources by program, semester and subject.",
  "/teaching",
);
export default function Teaching() {
  return (
    <PageShell
      eyebrow="Teaching collections"
      title="A clear path to your course."
      description="Choose your program, select a semester, and open a subject to find its available resources."
    >
      <div className="grid-three">
        {programmes.map((p) => (
          <ProgrammeCard key={p.slug} program={p} />
        ))}
      </div>
      <div className="callout mt-8">
        <p>{catalogNotice}</p>
      </div>
      <div className="mt-8">
        <Link className="text-link" href="/teaching/discrete-mathematics">
          Supplementary collection: Discrete Mathematics →
        </Link>
      </div>
      <div className="actions">
        <Link className="btn btn-primary" href="/resources">
          Search all resources →
        </Link>
        <Link className="text-link" href="/students">
          Study & project guidance →
        </Link>
      </div>
    </PageShell>
  );
}
