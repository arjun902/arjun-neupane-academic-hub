"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { phaseCourses } from "@/lib/portal";
import { supabase } from "@/lib/supabase";
import {
  CourseAccessError,
  clearCourseSession,
  courseRequest,
  getCourseSession,
  lockAllCourses,
} from "@/lib/course-access";
export function Catalogue() {
  const [courses, setCourses] = useState(phaseCourses);
  const [query, setQuery] = useState("");
  const [unlocked, setUnlocked] = useState<string[]>([]),
    [status, setStatus] = useState("");
  useEffect(() => {
    let alive = true;
    async function check() {
      const results = await Promise.all(
        phaseCourses.map(async (c) => {
          const session = getCourseSession(c.id);
          if (!session) return null;
          try {
            await courseRequest(c.id, { action: "validate" }, session.token);
            return c.id;
          } catch (e) {
            if (e instanceof CourseAccessError && e.code === "session_invalid")
              clearCourseSession(c.id);
            return null;
          }
        }),
      );
      if (alive) setUnlocked(results.filter((id): id is string => !!id));
    }
    void check();
    const timer = window.setInterval(() => void check(), 30000);
    const changed = () => void check();
    window.addEventListener("storage", changed);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener("storage", changed);
    };
  }, []);
  useEffect(() => {
    if (supabase)
      void supabase
        .from("hub_courses")
        .select("id,name,program,summary")
        .eq("visible", true)
        .order("display_order")
        .then(({ data }) => {
          if (data)
            setCourses(
              phaseCourses.map((c) => data.find((row) => row.id === c.id) || c),
            );
        });
  }, []);
  return (
    <section className="site-container py-12" id="courses">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Find your course</p>
          <h2 className="h2">A clearer path through your studies.</h2>
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
      <p className="mt-4 text-sm text-muted">
        Enter the course password provided by your instructor.
      </p>
      {!!unlocked.length && (
        <button
          className="btn btn-secondary mt-4"
          onClick={async () => {
            try {
              await lockAllCourses();
              setUnlocked([]);
              setStatus("All courses on this device are locked.");
            } catch (e) {
              setStatus((e as Error).message);
            }
          }}
        >
          Lock all courses on this device
        </button>
      )}
      <p role="status" className="mt-2 text-sm">
        {status}
      </p>
      {Array.from(new Set(courses.map((c) => c.program))).map((program) => (
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
                    href={"/courses/" + c.id}
                  >
                    {unlocked.includes(c.id)
                      ? "Continue Learning"
                      : "Unlock Course"}{" "}
                    <ArrowUpRight size={17} />
                  </Link>
                  <span className="mt-2 text-xs text-muted">
                    {unlocked.includes(c.id)
                      ? "Course session verified"
                      : "Course password required"}
                  </span>
                </article>
              ))}
          </div>
        </div>
      ))}
      {!courses.some((c) =>
        (c.name + " " + c.program).toLowerCase().includes(query.toLowerCase()),
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
