"use client";
import { useState } from "react";
import Link from "next/link";
import { programmes } from "@/content/programmes";
import { courses } from "@/content/courses";
import { searchCollections, courseResources } from "@/lib/content";
import { ResourceCard, EmptyState } from "./academic";
import { filterOfferings } from "@/lib/search";
export function ResourceSearch() {
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const results = filterOfferings(searchCollections, {
    query,
    program,
    semester,
    subject,
    type,
  });
  const reset = () => {
    setQuery("");
    setProgram("");
    setSemester("");
    setSubject("");
    setType("");
  };
  return (
    <>
      <form
        className="filters"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="resource-keyword">
          Search subjects, resources or topics
          <input
            id="resource-keyword"
            type="search"
            className="form-input"
            placeholder="Try pointers, compiler, SQL…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="filter-grid">
          <label>
            Program
            <select
              className="form-input"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
            >
              <option value="">All programs</option>
              <option value="supplementary">Supplementary</option>
              {programmes.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.shortName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Semester
            <select
              className="form-input"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="">All semesters</option>
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semester {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label>
            Subject
            <select
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">All subjects</option>

              {courses.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Resource type
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All types</option>
              {[
                "Notes",
                "Slides",
                "Lab",
                "Assignment",
                "Past questions",
                "Syllabus",
                "Sample code",
                "Reference",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="text-link mt-3" type="button" onClick={reset}>
          Clear filters
        </button>
      </form>
      <p role="status" className="result-count">
        {results.length} subject collection{results.length === 1 ? "" : "s"}{" "}
        found
      </p>
      {results.map((o) => (
        <section key={o.path} className="mb-8">
          <p className="eyebrow">
            {o.program.shortName} · Semester {o.semester}
          </p>
          <h2 className="text-2xl">
            <Link href={o.path}>{o.course.name} →</Link>
          </h2>
          {courseResources(o.course.slug, o.program.slug, o.semester)
            .filter((r) => !type || r.type === type)
            .map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
        </section>
      ))}
      {!results.length && (
        <EmptyState title="No matching materials">
          Try a broader keyword or clear a filter. Some resource types have not
          been published yet.
        </EmptyState>
      )}
    </>
  );
}
