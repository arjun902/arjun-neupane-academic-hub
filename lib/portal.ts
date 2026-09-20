export const phaseCourses = [
  {
    id: "bca-digital-logic",
    name: "Digital Logic",
    program: "TU BCA",
    summary:
      "Explore logic, digital circuits, and the foundations of computing.",
  },
  {
    id: "bca-c-programming",
    name: "C Programming",
    program: "TU BCA",
    summary: "Build a practical foundation in structured programming with C.",
  },
  {
    id: "csit-compiler-design",
    name: "Compiler Design",
    program: "TU BSc CSIT",
    summary:
      "Understand how programming languages are translated and implemented.",
  },
  {
    id: "csit-cryptography",
    name: "Cryptography",
    program: "TU BSc CSIT",
    summary:
      "Study the principles behind secure communication and information protection.",
  },
  {
    id: "csit-discrete-mathematics",
    name: "Discrete Mathematics",
    program: "TU BSc CSIT",
    summary: "Develop mathematical reasoning for computer science.",
  },
  {
    id: "csit-numerical-methods",
    name: "Numerical Methods",
    program: "TU BSc CSIT",
    summary: "Approach mathematical problems through computational methods.",
  },
];
export const categories = [
  "Overview",
  "Syllabus",
  "Unit-wise Notes",
  "Slides",
  "Labs / Practical Work",
  "Assignments",
  "Question Bank",
  "Past Questions",
  "Solutions",
  "References",
] as const;
export type Course = {
  id: string;
  name: string;
  program: string;
  summary: string;
  visible: boolean;
  code: string | null;
  semester: string | null;
  credits: string | null;
  syllabus_version: string | null;
};
export type Unit = {
  id: string;
  course_id: string;
  title: string;
  display_order: number;
};
export type Resource = {
  id: string;
  course_id: string;
  unit_id: string | null;
  title: string;
  description: string;
  category: string;
  file_path: string | null;
  filename: string | null;
  mime: string | null;
  size: number | null;
  external_url: string | null;
  tags: string[];
  status: string;
  release_at: string | null;
  display_order: number;
  preview_enabled: boolean;
  download_enabled: boolean;
  updated_at: string;
};
export type Activity = {
  student_id: string;
  resource_id: string;
  bookmarked: boolean;
  completed: boolean;
  last_opened_at: string | null;
};
export type Account = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "student";
  status: "active" | "suspended";
  expires_at: string | null;
  must_change_password: boolean;
  credential_version: number;
};
