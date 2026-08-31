"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Download,
  FileQuestion,
  FileText,
  FlaskConical,
  LockKeyhole
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseOffering, ResourceCategorySlug } from "@/lib/academics";
import { supabase } from "@/lib/supabase";

type Category = {
  slug: ResourceCategorySlug;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

type PublishedResource = {
  id: string;
  title: string;
  program: string;
  semester: string | null;
  material_type: string;
  file_path: string | null;
  updated_at: string;
  subjects: { name: string } | null;
};

const categories: Category[] = [
  {
    slug: "notes",
    label: "Notes",
    shortLabel: "Notes",
    description: "Unit-wise explanations, lecture summaries, key concepts, and revision checklists.",
    icon: BookOpenCheck
  },
  {
    slug: "assignments",
    label: "Assignments",
    shortLabel: "Assignments",
    description: "Assignment briefs, submission guidance, marking rubrics, and post-deadline solutions.",
    icon: ClipboardList
  },
  {
    slug: "lab-reports",
    label: "Lab Reports",
    shortLabel: "Lab Reports",
    description: "Practical sheets, report formats, expected outputs, safety notes, and viva preparation.",
    icon: FlaskConical
  },
  {
    slug: "old-questions",
    label: "Old Questions",
    shortLabel: "Old Questions",
    description: "Past papers organized by year, topic mapping, exam patterns, and answer guidance.",
    icon: FileQuestion
  }
];

const researchCategories: Category[] = categories.map((category) =>
  category.slug === "lab-reports"
    ? {
        ...category,
        label: "Research Work",
        shortLabel: "Research Work",
        description: "Research briefs, proposals, literature reviews, evidence records, drafts, and presentation guidance.",
        icon: FileText
      }
    : category
);

const deliverables: Record<ResourceCategorySlug, string[]> = {
  notes: ["Unit-wise course notes", "Lecture summary and key terms", "Exam revision checklist"],
  assignments: ["Assignment brief and due-date sheet", "Submission format and marking rubric", "Practice set and solution release"],
  "lab-reports": ["Lab sheet or practical workbook", "Report template and sample structure", "Output checklist and viva questions"],
  "old-questions": ["Past papers grouped by academic year", "Unit and topic question index", "Model-answer and marking guidance"]
};

const researchDeliverables: Record<ResourceCategorySlug, string[]> = {
  ...deliverables,
  "lab-reports": ["Research brief or proposal", "Literature review and source record", "Draft, citation, and presentation checklist"]
};

export function CourseResourceExplorer({
  programName,
  programShortName,
  semesterNumber,
  course
}: {
  programName: string;
  programShortName: string;
  semesterNumber: number;
  course: CourseOffering;
}) {
  const [activeSlug, setActiveSlug] = useState<ResourceCategorySlug>("notes");
  const [publishedResources, setPublishedResources] = useState<PublishedResource[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(supabase ? "loading" : "ready");
  const [downloadStatus, setDownloadStatus] = useState("");
  const courseCategories = course.practical ? categories : researchCategories;
  const courseDeliverables = course.practical ? deliverables : researchDeliverables;
  const active = courseCategories.find((category) => category.slug === activeSlug) ?? courseCategories[0];
  const ActiveIcon = active.icon;
  const activeFiles = publishedResources.filter((item) => categoryForType(item.material_type, course.practical) === active.slug);

  function moveTab(event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % courseCategories.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + courseCategories.length) % courseCategories.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = courseCategories.length - 1;
    else return;

    event.preventDefault();
    const next = courseCategories[nextIndex];
    selectCategory(next.slug);
    document.getElementById(`resource-tab-${next.slug}`)?.focus();
  }

  function selectCategory(slug: ResourceCategorySlug) {
    setActiveSlug(slug);
    if (window.location.hash !== `#${slug}`) {
      window.history.pushState(null, "", `#${slug}`);
    }
  }

  useEffect(() => {
    function syncCategoryFromUrl() {
      const slug = window.location.hash.slice(1);
      if (!slug) {
        setActiveSlug("notes");
        return;
      }
      if (categories.some((category) => category.slug === slug)) {
        setActiveSlug(slug as ResourceCategorySlug);
      }
    }

    syncCategoryFromUrl();
    window.addEventListener("hashchange", syncCategoryFromUrl);
    window.addEventListener("popstate", syncCategoryFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncCategoryFromUrl);
      window.removeEventListener("popstate", syncCategoryFromUrl);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!supabase) return;

    async function loadPublishedResources() {
      const result = await supabase!
        .from("materials")
        .select("id, title, program, semester, material_type, file_path, updated_at, subjects(name)")
        .eq("published", true)
        .eq("program", programShortName)
        .order("updated_at", { ascending: false });

      if (!mounted) return;
      if (result.error) {
        setLoadState("error");
        return;
      }

      const rows = (result.data || []) as unknown as PublishedResource[];
      setPublishedResources(rows.filter((item) => {
        const itemSemester = semesterFromValue(item.semester);
        const correctSemester = itemSemester === null || itemSemester === semesterNumber;
        const correctSubject = item.subjects?.name === course.name;
        return correctSemester && correctSubject;
      }));
      setLoadState("ready");
    }

    void loadPublishedResources();
    return () => { mounted = false; };
  }, [course.name, programShortName, semesterNumber]);

  async function downloadPublishedResource(item: PublishedResource) {
    if (!supabase || !item.file_path) {
      setDownloadStatus("This resource does not have an uploaded file yet.");
      return;
    }
    setDownloadStatus("Preparing your download...");
    const result = await supabase.storage.from("materials").createSignedUrl(item.file_path, 60);
    if (result.error || !result.data.signedUrl) {
      setDownloadStatus("The file could not be opened. Please try again or sign in to your account.");
      return;
    }
    setDownloadStatus("");
    window.location.assign(result.data.signedUrl);
  }

  function downloadRoadmap() {
    const lines = [
      `${course.name} — ${active.label} Collection Outline`,
      "=".repeat(`${course.name} — ${active.label} Collection Outline`.length),
      "",
      `Program: ${programName} (${programShortName})`,
      `Semester: ${semesterNumber}`,
      `Roadmap code: ${course.code}`,
      `Credits: ${course.credits}`,
      "",
      active.description,
      "",
      "Collection scope:",
      ...courseDeliverables[active.slug].map((item, index) => `${index + 1}. ${item}`),
      "",
      "Sign in to the Student Dashboard for course files and updates published by your teacher."
    ];
    const blobUrl = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `${programShortName.toLowerCase()}-semester-${semesterNumber}-${course.slug}-${active.slug}-outline.txt`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <section aria-labelledby="course-resources-title">
      <div className="mb-7 max-w-3xl">
        <p className="eyebrow">Subject resource library</p>
        <h2 className="h2" id="course-resources-title">Resources for {course.name}.</h2>
        <p className="mt-4 text-muted">
          Select a collection to review published files and its intended scope. New material appears here as it is prepared
          for teaching, practice, research, and assessment.
        </p>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        role="tablist"
        aria-label={`${course.name} resource types`}
      >
        {courseCategories.map((category, index) => {
          const Icon = category.icon;
          const selected = category.slug === active.slug;
          return (
            <button
              key={category.slug}
              type="button"
              role="tab"
              id={`resource-tab-${category.slug}`}
              aria-selected={selected}
              aria-controls="course-resource-panel"
              tabIndex={selected ? 0 : -1}
              className={`rounded-lg border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-teal/15 ${
                selected
                  ? "border-teal bg-teal/10 text-teal-deep shadow-soft"
                  : "border-line bg-white text-slate-700 hover:border-teal/50 hover:bg-teal/5"
              }`}
              onClick={() => selectCategory(category.slug)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              <Icon className="mb-3" size={22} />
              <strong className="block text-base">{category.shortLabel}</strong>
              <span className="mt-1 block text-xs font-semibold text-muted">View collection scope</span>
            </button>
          );
        })}
      </div>

      <div
        className="mt-5 rounded-lg border border-line bg-white p-5 shadow-premium md:p-7"
        role="tabpanel"
        id="course-resource-panel"
        aria-labelledby={`resource-tab-${active.slug}`}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <span className="icon-box"><ActiveIcon size={22} /></span>
            <h3 className="text-2xl font-bold text-ink">{active.label}</h3>
            <p className="mt-2 max-w-3xl text-muted">{active.description}</p>
          </div>
          <span className="tag justify-self-start">{programShortName} · Semester {semesterNumber}</span>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-slate-50 p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-ink">Published {active.label.toLowerCase()}</h4>
              <p className="mt-1 text-sm text-muted">This list contains only files assigned to this program, semester, and subject.</p>
            </div>
            <span className="pill">{activeFiles.length} {activeFiles.length === 1 ? "file" : "files"}</span>
          </div>
          {loadState === "loading" ? <p className="text-sm text-muted">Checking the latest published files...</p> : null}
          {loadState === "error" ? <p className="text-sm text-plum">Published files could not be loaded right now. The collection outline remains available below.</p> : null}
          {loadState === "ready" && !activeFiles.length ? (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-muted">
              No files have been published in this collection yet.
            </p>
          ) : null}
          {activeFiles.length ? (
            <div className="grid gap-3">
              {activeFiles.map((item) => (
                <article className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                  <div>
                    <strong className="text-ink">{item.title}</strong>
                    <p className="mt-1 text-xs font-semibold text-muted">Updated {item.updated_at.slice(0, 10)} · {item.material_type}</p>
                  </div>
                  <button className="btn btn-secondary shrink-0" type="button" onClick={() => void downloadPublishedResource(item)}>
                    <Download size={17} /> Download
                  </button>
                </article>
              ))}
            </div>
          ) : null}
          {downloadStatus ? <p className="mt-3 text-sm font-bold text-teal-deep" role="status">{downloadStatus}</p> : null}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {courseDeliverables[active.slug].map((item) => (
            <article className="rounded-lg border border-line bg-slate-50 p-4" key={item}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <CheckCircle2 className="text-teal-deep" size={20} />
                <span className="pill">Collection guide</span>
              </div>
              <h4 className="font-bold text-ink">{item}</h4>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
          <button className="btn btn-secondary" type="button" onClick={downloadRoadmap}>
            <Download size={18} /> Download collection outline
          </button>
          <Link className="btn btn-primary" href="/login">
            <LockKeyhole size={18} /> Sign in for course files
          </Link>
        </div>
      </div>
    </section>
  );
}

function semesterFromValue(value: string | null) {
  if (!value) return null;
  if (value.toLowerCase() === "final") return 8;
  const match = /[1-8]/.exec(value);
  return match ? Number(match[0]) : null;
}

function categoryForType(type: string, practical: boolean): ResourceCategorySlug {
  const normalized = type.trim().toLowerCase();
  if (!practical && ["research", "proposal", "literature", "methodology", "project"].some((term) => normalized.includes(term))) {
    return "lab-reports";
  }
  if (normalized.includes("assign") || normalized.includes("project")) return "assignments";
  if (normalized.includes("lab") || normalized.includes("report") || normalized.includes("practical")) return "lab-reports";
  if (normalized.includes("question") || normalized.includes("past") || normalized.includes("solution")) return "old-questions";
  return "notes";
}
