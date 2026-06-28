"use client";

import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/cards";
import { resources } from "@/lib/data";

const programs = ["All", "BCA", "CSIT", "BE"];
const semesters = ["All", "1st", "2nd", "3rd", "4th", "5th", "6th", "8th", "Final"];
const types = [
  "All",
  "Notes",
  "Slides",
  "Lab Reports",
  "Assignments",
  "Question Banks",
  "Solutions",
  "Project Guidelines",
  "Internship Report Format",
  "Research Paper Templates"
];

export function ResourceHub() {
  const [query, setQuery] = useState("");
  const [program, setProgram] = useState("All");
  const [semester, setSemester] = useState("All");
  const [type, setType] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((item) => {
      const haystack = `${item.title} ${item.program} ${item.semester} ${item.subject} ${item.type}`.toLowerCase();
      return (
        (!q || haystack.includes(q)) &&
        (program === "All" || item.program === program) &&
        (semester === "All" || item.semester === semester) &&
        (type === "All" || item.type === type)
      );
    });
  }, [program, query, semester, type]);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_repeat(3,minmax(140px,0.55fr))]">
        <Field label="Search">
          <input
            className="h-11 rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/10"
            type="search"
            placeholder="Search notes, labs, question banks..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Select label="Program" value={program} onChange={setProgram} options={programs} />
        <Select label="Semester" value={semester} onChange={setSemester} options={semesters} />
        <Select label="Type" value={type} onChange={setType} options={types} />
      </div>
      <div className="grid gap-5">
        {filtered.length ? (
          filtered.map((item) => <ResourceCard item={item} key={item.title} />)
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-muted">
            No materials match those filters yet. Try another program, semester, or keyword.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-extrabold text-slate-700">
      {label}
      {children}
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select
        className="h-11 rounded-lg border border-line bg-slate-50 px-3 outline-none focus:border-teal focus:ring-4 focus:ring-teal/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}
