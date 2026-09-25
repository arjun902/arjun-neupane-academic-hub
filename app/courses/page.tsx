import { Catalogue } from "@/components/catalogue";
export const metadata = { title: "Courses" };
export default function Courses() {
  return (
    <main id="main-content">
      <div className="site-container pt-10">
        <p className="eyebrow">Course catalogue</p>
        <h1 className="h2">Learn with purpose.</h1>
        <p className="mt-3 text-muted">
          Browse notes, slides, practical work, and revision materials. Open to
          everyone, with no sign-in required.
        </p>
      </div>
      <Catalogue />
    </main>
  );
}
