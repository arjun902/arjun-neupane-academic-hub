import { courses } from "@/content/courses";
import { programmes } from "@/content/programmes";
import { resources } from "@/content/resources";
export const courseById = (id: string) => courses.find((c) => c.slug === id);
export const programBySlug = (slug: string) =>
  programmes.find(
    (p) =>
      p.slug ===
      ({ csit: "bsc-csit", be: "be-computer-engineering" }[slug] || slug),
  );
export const coursePath = (
  program: string,
  semester: number,
  subject: string,
) => `/subjects/${program}/semester-${semester}/${subject}`;
export const offerings = programmes.flatMap((p) =>
  p.semesters.flatMap((s) =>
    s.courseIds.map((id) => ({
      program: p,
      semester: s.number,
      course: courseById(id)!,
      path: coursePath(p.slug, s.number, id),
    })),
  ),
);
export const searchCollections = [
  ...offerings,
  {
    program: {
      slug: "supplementary",
      name: "Supplementary learning",
      shortName: "Supplementary",
      description: "Additional subject references.",
      semesters: [],
    },
    semester: 0,
    course: courseById("discrete-mathematics")!,
    path: "/teaching/discrete-mathematics",
  },
];
export const courseResources = (
  subject: string,
  program?: string,
  semester?: number,
) =>
  resources.filter(
    (r) =>
      r.status === "published" &&
      r.subject === subject &&
      (!r.programs || !program || r.programs.includes(program)) &&
      (!r.semesters || !semester || r.semesters.includes(semester)),
  );
