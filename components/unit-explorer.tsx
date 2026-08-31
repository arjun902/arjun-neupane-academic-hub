"use client";

import Link from "next/link";
import { Download, FileDown, MessageSquareText, Send } from "lucide-react";
import { useState } from "react";

const units = [
  {
    label: "Overview and syllabus",
    title: "Unit 1: Course Overview and Foundations",
    body: "Review the syllabus, learning outcomes, prerequisite concepts, assessment criteria, and recommended preparation."
  },
  {
    label: "Unit-wise notes",
    title: "Unit 2: Core Theory and Classroom Notes",
    body: "Study the main ideas through explanations, diagrams, definitions, worked examples, and relevant past questions."
  },
  {
    label: "Labs and assignments",
    title: "Unit 3: Practical Labs and Assignments",
    body: "Complete the practical sheets and assignments, then check the required format, expected output, and viva questions."
  },
  {
    label: "Question bank",
    title: "Unit 4: Question Bank and Solutions",
    body: "Practise with past questions, model answers, short notes, numerical exercises, and a planned revision sequence."
  },
  {
    label: "Projects and grading",
    title: "Unit 5: Project Ideas and Assessment",
    body: "Choose a manageable project, follow the report format and assessment criteria, and prepare to explain your decisions."
  }
];

export function UnitExplorer() {
  const [active, setActive] = useState(0);
  const unit = units[active];

  function downloadUnit() {
    const text = `${unit.title}\n${"=".repeat(unit.title.length)}\n\n${unit.body}\n\nUse this outline as a revision checklist. Sign in to the Student Dashboard for the course files shared by your teacher.`;
    const blobUrl = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `unit-${active + 1}-study-outline.txt`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

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
            <h3 className="mb-2 text-xl font-bold">Study outline</h3>
            <p className="mb-5 text-muted">Keep a short outline of the notes, practical work, assignment, and revision tasks for this unit.</p>
            <button type="button" className="btn btn-secondary" onClick={downloadUnit}>
              <Download size={18} />
              Download study outline
            </button>
          </article>
          <article className="card">
            <span className="icon-box bg-[#f8eaf0] text-plum">
              <MessageSquareText size={22} />
            </span>
            <h3 className="mb-2 text-xl font-bold">Ask your teacher</h3>
            <p className="mb-5 text-muted">Use the student dashboard to ask a question about this unit or review your teacher's feedback.</p>
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
