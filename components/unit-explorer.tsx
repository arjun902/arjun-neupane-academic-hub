"use client";

import Link from "next/link";
import { Download, FileDown, MessageSquareText, Send } from "lucide-react";
import { useState } from "react";

const units = [
  {
    label: "Overview and syllabus",
    title: "Unit 1: Course Overview and Foundations",
    body: "Syllabus map, learning outcomes, prerequisite concepts, grading rubric, and preparation checklist."
  },
  {
    label: "Unit-wise notes",
    title: "Unit 2: Core Theory and Classroom Notes",
    body: "Unit-wise explanations with diagrams, key definitions, solved examples, and old question alignment."
  },
  {
    label: "Labs and assignments",
    title: "Unit 3: Practical Labs and Assignments",
    body: "Lab sheets, submission format, viva questions, sample outputs, and evaluation checkpoints."
  },
  {
    label: "Question bank",
    title: "Unit 4: Question Bank and Solutions",
    body: "Exam-focused question sets, model answers, short notes, numerical practice, and revision sequence."
  },
  {
    label: "Projects and grading",
    title: "Unit 5: Project Ideas and Assessment",
    body: "Mini project options, report format, grading criteria, defense preparation, and feedback workflow."
  }
];

export function UnitExplorer() {
  const [active, setActive] = useState(0);
  const unit = units[active];

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="overflow-hidden rounded-lg border border-line bg-white">
        {units.map((item, index) => (
          <button
            type="button"
            key={item.label}
            className={`block w-full border-b border-line px-4 py-4 text-left text-sm font-extrabold last:border-b-0 ${
              active === index ? "bg-teal/10 text-teal-deep" : "text-slate-700 hover:bg-teal/10"
            }`}
            onClick={() => setActive(index)}
          >
            {item.label}
          </button>
        ))}
      </aside>
      <section className="rounded-lg border border-line bg-white p-6 shadow-premium">
        <h3 className="mb-2 text-2xl font-bold text-ink">{unit.title}</h3>
        <p className="mb-6 text-muted">{unit.body}</p>
        <div className="grid gap-5 md:grid-cols-2">
          <article className="card">
            <span className="icon-box">
              <FileDown size={22} />
            </span>
            <h3 className="mb-2 text-xl font-bold">Download Pack</h3>
            <p className="mb-5 text-muted">PDF notes, lab sheet, assignment brief, and quick revision checklist.</p>
            <button type="button" className="btn btn-secondary">
              <Download size={18} />
              Download resources
            </button>
          </article>
          <article className="card">
            <span className="icon-box bg-[#f8eaf0] text-plum">
              <MessageSquareText size={22} />
            </span>
            <h3 className="mb-2 text-xl font-bold">Teacher Feedback</h3>
            <p className="mb-5 text-muted">Ask unit-specific questions and receive structured feedback through the student dashboard.</p>
            <Link href="/student" className="btn btn-ghost">
              <Send size={18} />
              Open dashboard
            </Link>
          </article>
        </div>
      </section>
    </div>
  );
}
