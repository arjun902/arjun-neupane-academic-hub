import type {
  ProgramSlug,
  ResourceCategorySlug,
  SemesterNumber,
  SubjectSlug
} from "@/lib/academics";

export type BundledCourseResource = {
  readonly title: string;
  readonly description: string;
  readonly category: ResourceCategorySlug;
  readonly filePath: `/resources/${string}.pdf`;
  readonly pages: number;
  readonly documentCredit: string;
};

type CourseResourceKey = `${ProgramSlug}:semester-${SemesterNumber}:${SubjectSlug}`;

const resourcesByCourse = {
  "bca:semester-2:c-programming": [
    {
      title: "BCA C Programming (CACS151) Course Syllabus",
      description:
        "The three-page course outline covering contact hours, unit content, practical work, and the recommended reading list.",
      category: "notes",
      filePath: "/resources/bca/semester-2/c-programming/c-programming-syllabus-cacs151.pdf",
      pages: 3,
      documentCredit: "BCA Notes Nepal syllabus copy"
    },
    {
      title: "Programming in C: Course Notes",
      description:
        "A 30-page reference covering core C syntax, program structure, operators, control flow, functions, arrays, pointers, structures, and files.",
      category: "notes",
      filePath: "/resources/bca/semester-2/c-programming/c-programming-course-notes.pdf",
      pages: 30,
      documentCredit: "Script Web Solution Pvt. Ltd."
    },
    {
      title: "Characteristics of a Good Program and the Program Development Cycle",
      description:
        "A concise note on readability, portability, efficiency, structure, documentation, and the stages used to develop a program.",
      category: "notes",
      filePath: "/resources/bca/semester-2/c-programming/features-of-a-good-program.pdf",
      pages: 2,
      documentCredit: "Provided course material"
    },
    {
      title: "C Programming Vacation Homework: Model Question Bank",
      description:
        "A structured practice set for vacation study, with model questions spanning the major topics in the course.",
      category: "assignments",
      filePath: "/resources/bca/semester-2/c-programming/c-programming-vacation-homework.pdf",
      pages: 7,
      documentCredit: "Provided course material"
    },
    {
      title: "Pointer and Structure Lab Sheets (Lab Sheets 7-8)",
      description:
        "Practical exercises on pointers and structures, arranged as two focused laboratory sheets.",
      category: "lab-reports",
      filePath: "/resources/bca/semester-2/c-programming/pointer-and-structure-lab-sheets.pdf",
      pages: 1,
      documentCredit: "Er. Arjun Neupane"
    },
    {
      title: "C Programming Mid-Term Examination 2082: MCQs (Group A)",
      description:
        "The multiple-choice section of the KMC BCA Semester II mid-term examination for CACS151.",
      category: "old-questions",
      filePath: "/resources/bca/semester-2/c-programming/c-programming-midterm-2082-mcqs.pdf",
      pages: 2,
      documentCredit: "Kathmandu Model College"
    },
    {
      title: "C Programming Mid-Term Examination 2082: Theory Questions",
      description:
        "Groups B and C from the KMC BCA Semester II mid-term examination, covering short and long theory questions.",
      category: "old-questions",
      filePath: "/resources/bca/semester-2/c-programming/c-programming-midterm-2082-theory-questions.pdf",
      pages: 1,
      documentCredit: "Kathmandu Model College"
    },
    {
      title: "TU BCA File Handling Questions with Solutions",
      description:
        "A focused revision set that pairs important file-handling questions with worked explanations and C examples.",
      category: "old-questions",
      filePath: "/resources/bca/semester-2/c-programming/file-handling-questions-with-solutions.pdf",
      pages: 9,
      documentCredit: "Er. Arjun Neupane"
    }
  ]
} as const satisfies Partial<Record<CourseResourceKey, readonly BundledCourseResource[]>>;

export function getBundledCourseResources(
  programSlug: ProgramSlug,
  semesterNumber: number,
  subjectSlug: SubjectSlug
): readonly BundledCourseResource[] {
  const key = `${programSlug}:semester-${semesterNumber}:${subjectSlug}` as CourseResourceKey;
  return resourcesByCourse[key as keyof typeof resourcesByCourse] ?? [];
}
