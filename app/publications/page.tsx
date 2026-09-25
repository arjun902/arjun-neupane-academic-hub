import { PageShell, EmptyState } from "@/components/academic";
import { PublicationList } from "@/components/publication-list";
import { publications } from "@/content/publications";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Publications",
  "Verified bibliographic records and scholarly outputs by Arjun Neupane.",
  "/publications",
);
export default function Publications() {
  return (
    <PageShell
      eyebrow="Scholarly work"
      title="Publications"
      description="A record of scholarly outputs, with source links and citation details when available."
    >
      {publications.length ? (
        <PublicationList items={publications} />
      ) : (
        <EmptyState title="Publication list forthcoming">
          Verified bibliographic records have not yet been added to this
          website.
        </EmptyState>
      )}
    </PageShell>
  );
}
