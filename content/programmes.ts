import type { AcademicProgram } from "./types";
export const catalogNotice =
  "An independent teaching collection, not an official curriculum. Semester groupings are retained from this site; confirm placement and the current syllabus with your institution.";
export const programmes: AcademicProgram[] = [
  {
    slug: "bsc-csit",
    name: "BSc Computer Science and Information Technology",
    shortName: "BSc CSIT",
    description:
      "The CSIT collection starts with programming and digital systems. Later semesters address data structures, databases, networks, security, research methods, quantum computing, and IoT.",
    semesters: [
      {
        number: 1,
        courseIds: ["c-programming", "digital-logic"],
      },
      {
        number: 2,
        courseIds: ["numerical-methods"],
      },
      {
        number: 3,
        courseIds: ["data-structures-and-algorithms"],
      },
      {
        number: 4,
        courseIds: ["java-programming", "database-management-system"],
      },
      {
        number: 5,
        courseIds: [
          "microprocessor-and-assembly-language",
          "computer-networking",
        ],
      },
      {
        number: 6,
        courseIds: ["compiler-design", "cryptography"],
      },
      {
        number: 7,
        courseIds: ["cybersecurity-fundamentals", "research-methodology"],
      },
      {
        number: 8,
        courseIds: ["quantum-computing", "iot-and-embedded-systems"],
      },
    ],
  },
  {
    slug: "bca",
    name: "Bachelor of Computer Applications",
    shortName: "BCA",
    description:
      "The BCA collection focuses on software development and applied computing. It also includes data management, networking, security, and research methods.",
    semesters: [
      {
        number: 1,
        courseIds: [],
      },
      {
        number: 2,
        courseIds: ["c-programming", "digital-logic"],
      },
      {
        number: 3,
        courseIds: ["java-programming", "data-structures-and-algorithms"],
      },
      {
        number: 4,
        courseIds: ["numerical-methods", "database-management-system"],
      },
      {
        number: 5,
        courseIds: ["computer-networking"],
      },
      {
        number: 6,
        courseIds: ["cybersecurity-fundamentals"],
      },
      {
        number: 7,
        courseIds: ["research-methodology"],
      },
      {
        number: 8,
        courseIds: ["quantum-computing"],
      },
    ],
  },
  {
    slug: "be-computer-engineering",
    name: "BE Computer Engineering",
    shortName: "BE",
    description:
      "The BE Computer Engineering collection combines software and digital hardware. Later subjects cover networks, embedded systems, security, and research methods.",
    semesters: [
      {
        number: 1,
        courseIds: ["c-programming"],
      },
      {
        number: 2,
        courseIds: ["digital-logic"],
      },
      {
        number: 3,
        courseIds: ["data-structures-and-algorithms", "numerical-methods"],
      },
      {
        number: 4,
        courseIds: ["microprocessor-and-assembly-language"],
      },
      {
        number: 5,
        courseIds: ["database-management-system", "computer-networking"],
      },
      {
        number: 6,
        courseIds: ["compiler-design", "cryptography"],
      },
      {
        number: 7,
        courseIds: ["cybersecurity-fundamentals", "iot-and-embedded-systems"],
      },
      {
        number: 8,
        courseIds: ["research-methodology", "quantum-computing"],
      },
    ],
  },
];
