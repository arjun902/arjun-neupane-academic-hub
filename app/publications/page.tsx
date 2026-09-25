import { PageShell, EmptyState } from "@/components/academic";
import { PublicationList } from "@/components/publication-list";
import { publications } from "@/content/publications";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Publications",
  "Master's thesis and verified scholarly records by Arjun Neupane.",
  "/publications",
);
export default function Publications() {
  return (
    <PageShell
      eyebrow="Scholarly work"
      title="Thesis & publications"
      description="Scholarly work with its document type clearly identified. The MSc thesis is listed below; no journal or conference publication records have been supplied."
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
