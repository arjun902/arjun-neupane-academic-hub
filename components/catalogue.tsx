"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { phaseCourses } from "@/lib/portal";
import { publicSupabase as supabase } from "@/lib/public-supabase";
export function Catalogue() {
  const [courses, setCourses] = useState(phaseCourses);
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  useEffect(() => {
    if (supabase)
      void supabase
        .from("hub_courses")
        .select("id,name,program,summary")
        .eq("visible", true)
        .order("display_order")
        .then(({ data }) => {
          if (data) setCourses(data);
        });
  }, []);
  return (
    <section className="site-container py-12" id="courses">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Find your course</p>
          <h2 className="h2">Find your next learning opportunity.</h2>
        </div>
        <label className="grid gap-1 text-sm font-bold">
          Search courses
          <input
            className="form-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Course name or programme"
          />
        </label>
      </div>
      <div
        className="mt-6 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by programme"
      >
        {["", "TU BCA", "TU BSc CSIT"].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={programFilter === value}
            onClick={() => setProgramFilter(value)}
            className={
              "btn " +
              (programFilter === value ? "btn-primary" : "btn-secondary")
            }
          >
            {value || "All programmes"}
          </button>
        ))}
      </div>
      {Array.from(
        new Set(
          courses
            .filter(
              (c) =>
                (!programFilter || c.program === programFilter) &&
                (c.name + " " + c.program)
                  .toLowerCase()
                  .includes(query.toLowerCase()),
            )
            .map((c) => c.program),
        ),
      ).map((program) => (
        <div className="mt-9" key={program}>
          <h3 className="mb-4 border-b border-line pb-3 text-lg font-bold text-navy">
            {program}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter(
                (c) =>
                  c.program === program &&
                  (c.name + " " + c.program)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              .map((c) => (
                <article className="card flex flex-col" key={c.id}>
                  <BookOpen size={23} className="mb-5 text-teal-deep" />
                  <h4 className="text-xl font-bold text-navy">{c.name}</h4>
                  <p className="mb-6 mt-2 text-sm text-muted">{c.summary}</p>
                  <Link
                    className="mt-auto inline-flex items-center gap-2 font-bold text-teal-deep"
                    href={
                      phaseCourses.some((course) => course.id === c.id)
                        ? "/courses/" + c.id
                        : "/student/#" + c.id
                    }
                  >
                    Open course <ArrowUpRight size={17} />
                  </Link>
                  <span className="mt-2 text-xs text-muted">
                    Open access · No sign-in
                  </span>
                </article>
              ))}
          </div>
        </div>
      ))}
      {!courses.some(
        (c) =>
          (!programFilter || c.program === programFilter) &&
          (c.name + " " + c.program)
            .toLowerCase()
            .includes(query.toLowerCase()),
      ) && <p className="py-8">No courses match your search.</p>}
    </section>
  );
}
export function PublicAnnouncements() {
  const [items, setItems] = useState<
    { id: string; title: string; body: string }[]
  >([]);
  useEffect(() => {
    if (supabase)
      void supabase
        .from("hub_announcements")
        .select("id,title,body")
        .eq("is_public", true)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .then(({ data }) => setItems(data || []));
  }, []);
  return items.length ? (
    <section className="site-container py-8">
      <h2 className="h2">Announcements</h2>
      {items.map((a) => (
        <article className="card mt-4" key={a.id}>
          <h3 className="font-bold">{a.title}</h3>
          <p className="whitespace-pre-wrap">{a.body}</p>
        </article>
      ))}
    </section>
  ) : null;
}
