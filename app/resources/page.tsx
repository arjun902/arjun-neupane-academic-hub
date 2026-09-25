import { PageShell } from "@/components/academic";
import { ResourceSearch } from "@/components/resource-search";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Find resources",
  "Search open academic materials by program, semester, subject, topic and resource type.",
  "/resources",
);
export default function Resources() {
  return (
    <PageShell
      eyebrow="Open learning library"
      title="Find a useful starting point."
      description="Search course collections, learning references and study guidance."
    >
      <ResourceSearch />
    </PageShell>
  );
}
