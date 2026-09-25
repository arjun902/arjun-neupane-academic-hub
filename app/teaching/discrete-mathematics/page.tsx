import { PageShell, ResourceCard } from "@/components/academic";
import { pageMetadata } from "@/lib/metadata";
import { resources } from "@/content/resources";
export const metadata = pageMetadata(
  "Discrete Mathematics",
  "Supplementary references for logic, proofs, counting and graph theory.",
  "/teaching/discrete-mathematics",
);
export default function Discrete() {
  return (
    <PageShell
      eyebrow="Supplementary learning"
      title="Discrete Mathematics"
      description="Study logic, proof techniques, sets, relations, counting and graphs. This collection is not assigned an official program semester."
    >
      {resources
        .filter(
          (r) =>
            r.subject === "discrete-mathematics" && r.status === "published",
        )
        .map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
    </PageShell>
  );
}
