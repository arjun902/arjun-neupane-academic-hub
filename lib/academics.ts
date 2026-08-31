export type ResourceCategorySlug =
  | "notes"
  | "assignments"
  | "lab-reports"
  | "old-questions";

export type ProgramSlug = "bsc-csit" | "bca" | "be-computer-engineering";

export type SemesterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SubjectSlug =
  | "c-programming"
  | "digital-logic"
  | "microprocessor-and-assembly-language"
  | "java-programming"
  | "data-structures-and-algorithms"
  | "computer-networking"
  | "cryptography"
  | "compiler-design"
  | "quantum-computing"
  | "numerical-methods"
  | "database-management-system"
  | "cybersecurity-fundamentals"
  | "iot-and-embedded-systems"
  | "research-methodology";

export type CourseOffering = {
  readonly slug: SubjectSlug;
  readonly name: string;
  readonly code: string;
  readonly credits: number;
  readonly summary: string;
  readonly practical: boolean;
  readonly updated: `${number}-${number}-${number}`;
};

export type Semester = {
  readonly number: SemesterNumber;
  readonly year: 1 | 2 | 3 | 4;
  readonly label: string;
  readonly offerings: readonly CourseOffering[];
};

export type AcademicProgram = {
  readonly slug: ProgramSlug;
  readonly name: string;
  readonly shortName: "CSIT" | "BCA" | "BE";
  readonly durationYears: 4;
  readonly semesterCount: 8;
  readonly description: string;
  readonly catalogNotice: string;
  readonly semesters: readonly Semester[];
};

export type ResourceCategoryDescriptor = {
  readonly slug: ResourceCategorySlug;
  readonly name: string;
  readonly description: string;
};

export type OfferingRoute =
  `/subjects/${ProgramSlug}/semester-${SemesterNumber}/${SubjectSlug}`;

export type RoutedCourseOffering = CourseOffering & {
  readonly programSlug: ProgramSlug;
  readonly programName: string;
  readonly programShortName: AcademicProgram["shortName"];
  readonly semesterNumber: SemesterNumber;
  readonly semesterLabel: string;
  readonly route: OfferingRoute;
};

export const academicCatalogNotice =
  "This is an independent, selected collection of teaching resources. It is not an official curriculum; confirm course titles, codes, credits, and semester placement with your institution.";

export const resourceCategories = [
  {
    slug: "notes",
    name: "Notes",
    description: "Explanations by unit, worked examples, key terms, and revision summaries."
  },
  {
    slug: "assignments",
    name: "Assignments",
    description: "Practice questions and assessed tasks, with requirements and submission guidance."
  },
  {
    slug: "lab-reports",
    name: "Lab reports",
    description: "Laboratory instructions, report formats, implementation notes, and viva preparation."
  },
  {
    slug: "old-questions",
    name: "Old questions",
    description: "Past questions grouped by topic, with guidance for revision and examination practice."
  }
] as const satisfies readonly ResourceCategoryDescriptor[];

export const academicPrograms = [
  {
    slug: "bsc-csit",
    name: "BSc Computer Science and Information Technology",
    shortName: "CSIT",
    durationYears: 4,
    semesterCount: 8,
    description:
      "The CSIT collection starts with programming and digital systems. Later semesters address data structures, databases, networks, security, research methods, quantum computing, and IoT.",
    catalogNotice: academicCatalogNotice,
    semesters: [
      {
        number: 1,
        year: 1,
        label: "Semester 1",
        offerings: [
          {
            slug: "c-programming",
            name: "C Programming",
            code: "CSIT-R101",
            credits: 3,
            summary: "Students learn to translate problems into structured C programs through practice with control flow, functions, arrays, pointers, files, and debugging.",
            practical: true,
            updated: "2026-08-24"
          },
          {
            slug: "digital-logic",
            name: "Digital Logic",
            code: "CSIT-R102",
            credits: 3,
            summary: "This subject connects number systems and Boolean algebra with the design and analysis of combinational and sequential circuits.",
            practical: true,
            updated: "2026-08-20"
          }
        ]
      },
      {
        number: 2,
        year: 1,
        label: "Semester 2",
        offerings: [
          {
            slug: "numerical-methods",
            name: "Numerical Methods",
            code: "CSIT-R201",
            credits: 3,
            summary: "Students apply numerical techniques to equations, interpolation, integration, and differential equations while examining approximation and error.",
            practical: true,
            updated: "2026-08-18"
          }
        ]
      },
      {
        number: 3,
        year: 2,
        label: "Semester 3",
        offerings: [
          {
            slug: "data-structures-and-algorithms",
            name: "Data Structures and Algorithms",
            code: "CSIT-R301",
            credits: 4,
            summary: "Students learn to select, implement, and evaluate data structures and algorithms through complexity analysis and programming exercises.",
            practical: true,
            updated: "2026-08-26"
          }
        ]
      },
      {
        number: 4,
        year: 2,
        label: "Semester 4",
        offerings: [
          {
            slug: "java-programming",
            name: "Java Programming",
            code: "CSIT-R401",
            credits: 3,
            summary: "The subject develops object-oriented programming skills through classes, interfaces, exception handling, collections, and small applications.",
            practical: true,
            updated: "2026-08-22"
          },
          {
            slug: "database-management-system",
            name: "Database Management System",
            code: "CSIT-R402",
            credits: 3,
            summary: "The subject moves from conceptual data modelling to normalization, SQL, transactions, indexing, and reliable database-backed applications.",
            practical: true,
            updated: "2026-08-25"
          }
        ]
      },
      {
        number: 5,
        year: 3,
        label: "Semester 5",
        offerings: [
          {
            slug: "microprocessor-and-assembly-language",
            name: "Microprocessor and Assembly Language",
            code: "CSIT-R501",
            credits: 3,
            summary: "Students examine processor architecture, instruction execution, memory and I/O interfacing, interrupts, and assembly-language programming through practical exercises.",
            practical: true,
            updated: "2026-08-16"
          },
          {
            slug: "computer-networking",
            name: "Computer Networking",
            code: "CSIT-R502",
            credits: 3,
            summary: "The subject develops a working understanding of TCP/IP, subnetting, switching, routing, network services, packet analysis, and troubleshooting.",
            practical: true,
            updated: "2026-08-28"
          }
        ]
      },
      {
        number: 6,
        year: 3,
        label: "Semester 6",
        offerings: [
          {
            slug: "compiler-design",
            name: "Compiler Design",
            code: "CSIT-R601",
            credits: 3,
            summary: "The subject follows a source program through lexical analysis, parsing, semantic analysis, intermediate-code generation, and optimization.",
            practical: true,
            updated: "2026-08-12"
          },
          {
            slug: "cryptography",
            name: "Cryptography",
            code: "CSIT-R602",
            credits: 3,
            summary: "Students study encryption, hashing, digital signatures, authentication, and key exchange, with attention to their use in protecting modern systems.",
            practical: true,
            updated: "2026-08-27"
          }
        ]
      },
      {
        number: 7,
        year: 4,
        label: "Semester 7",
        offerings: [
          {
            slug: "cybersecurity-fundamentals",
            name: "Cybersecurity Fundamentals",
            code: "CSIT-R701",
            credits: 3,
            summary: "Students examine common threats and defensive controls through access management, secure configuration, web security, threat modelling, and practical labs.",
            practical: true,
            updated: "2026-08-29"
          },
          {
            slug: "research-methodology",
            name: "Research Methodology",
            code: "CSIT-R702",
            credits: 3,
            summary: "Students learn to frame researchable questions, review literature critically, select appropriate methods, analyse evidence, and report findings with proper citation and ethical practice.",
            practical: false,
            updated: "2026-08-21"
          }
        ]
      },
      {
        number: 8,
        year: 4,
        label: "Semester 8",
        offerings: [
          {
            slug: "quantum-computing",
            name: "Quantum Computing",
            code: "CSIT-R801",
            credits: 3,
            summary: "An introduction to qubits, superposition, entanglement, quantum gates, circuits, and selected algorithms, supported by simulation exercises.",
            practical: true,
            updated: "2026-08-14"
          },
          {
            slug: "iot-and-embedded-systems",
            name: "IoT and Embedded Systems",
            code: "CSIT-R802",
            credits: 3,
            summary: "Students design small connected systems using sensors, microcontrollers, communication protocols, data collection, and dashboard-based monitoring.",
            practical: true,
            updated: "2026-08-23"
          }
        ]
      }
    ]
  },
  {
    slug: "bca",
    name: "Bachelor of Computer Applications",
    shortName: "BCA",
    durationYears: 4,
    semesterCount: 8,
    description:
      "The BCA collection focuses on software development and applied computing. It also includes data management, networking, security, and research methods.",
    catalogNotice: academicCatalogNotice,
    semesters: [
      {
        number: 1,
        year: 1,
        label: "Semester 1",
        offerings: [
          {
            slug: "c-programming",
            name: "C Programming",
            code: "BCA-R101",
            credits: 3,
            summary: "Students learn to translate problems into structured C programs through practice with control flow, functions, arrays, pointers, files, and debugging.",
            practical: true,
            updated: "2026-08-24"
          }
        ]
      },
      {
        number: 2,
        year: 1,
        label: "Semester 2",
        offerings: [
          {
            slug: "digital-logic",
            name: "Digital Logic",
            code: "BCA-R201",
            credits: 3,
            summary: "This subject connects number systems and Boolean algebra with the design and analysis of combinational and sequential circuits.",
            practical: true,
            updated: "2026-08-20"
          }
        ]
      },
      {
        number: 3,
        year: 2,
        label: "Semester 3",
        offerings: [
          {
            slug: "java-programming",
            name: "Java Programming",
            code: "BCA-R301",
            credits: 3,
            summary: "The subject develops object-oriented programming skills through classes, interfaces, exception handling, collections, and small applications.",
            practical: true,
            updated: "2026-08-22"
          },
          {
            slug: "data-structures-and-algorithms",
            name: "Data Structures and Algorithms",
            code: "BCA-R302",
            credits: 3,
            summary: "Students learn to select, implement, and evaluate data structures and algorithms through complexity analysis and programming exercises.",
            practical: true,
            updated: "2026-08-26"
          }
        ]
      },
      {
        number: 4,
        year: 2,
        label: "Semester 4",
        offerings: [
          {
            slug: "numerical-methods",
            name: "Numerical Methods",
            code: "BCA-R401",
            credits: 3,
            summary: "Students apply numerical techniques to equations, interpolation, integration, and differential equations while examining approximation and error.",
            practical: true,
            updated: "2026-08-18"
          },
          {
            slug: "database-management-system",
            name: "Database Management System",
            code: "BCA-R402",
            credits: 3,
            summary: "The subject moves from conceptual data modelling to normalization, SQL, transactions, indexing, and reliable database-backed applications.",
            practical: true,
            updated: "2026-08-25"
          }
        ]
      },
      {
        number: 5,
        year: 3,
        label: "Semester 5",
        offerings: [
          {
            slug: "computer-networking",
            name: "Computer Networking",
            code: "BCA-R501",
            credits: 3,
            summary: "The subject develops a working understanding of TCP/IP, subnetting, switching, routing, network services, packet analysis, and troubleshooting.",
            practical: true,
            updated: "2026-08-28"
          }
        ]
      },
      {
        number: 6,
        year: 3,
        label: "Semester 6",
        offerings: [
          {
            slug: "cybersecurity-fundamentals",
            name: "Cybersecurity Fundamentals",
            code: "BCA-R601",
            credits: 3,
            summary: "Students examine common threats and defensive controls through access management, secure configuration, web security, threat modelling, and practical labs.",
            practical: true,
            updated: "2026-08-29"
          }
        ]
      },
      {
        number: 7,
        year: 4,
        label: "Semester 7",
        offerings: [
          {
            slug: "research-methodology",
            name: "Research Methodology",
            code: "BCA-R701",
            credits: 3,
            summary: "Students learn to frame researchable questions, review literature critically, select appropriate methods, analyse evidence, and report findings with proper citation and ethical practice.",
            practical: false,
            updated: "2026-08-21"
          }
        ]
      },
      {
        number: 8,
        year: 4,
        label: "Semester 8",
        offerings: [
          {
            slug: "quantum-computing",
            name: "Quantum Computing",
            code: "BCA-R801",
            credits: 3,
            summary: "An introduction to qubits, superposition, entanglement, quantum gates, circuits, and selected algorithms, supported by simulation exercises.",
            practical: true,
            updated: "2026-08-14"
          }
        ]
      }
    ]
  },
  {
    slug: "be-computer-engineering",
    name: "BE Computer Engineering",
    shortName: "BE",
    durationYears: 4,
    semesterCount: 8,
    description:
      "The BE Computer Engineering collection combines software and digital hardware. Later subjects cover networks, embedded systems, security, and research methods.",
    catalogNotice: academicCatalogNotice,
    semesters: [
      {
        number: 1,
        year: 1,
        label: "Semester 1",
        offerings: [
          {
            slug: "c-programming",
            name: "C Programming",
            code: "BE-R101",
            credits: 3,
            summary: "Students learn to translate problems into structured C programs through practice with control flow, functions, arrays, pointers, files, and debugging.",
            practical: true,
            updated: "2026-08-24"
          }
        ]
      },
      {
        number: 2,
        year: 1,
        label: "Semester 2",
        offerings: [
          {
            slug: "digital-logic",
            name: "Digital Logic",
            code: "BE-R201",
            credits: 3,
            summary: "This subject connects number systems and Boolean algebra with the design and analysis of combinational and sequential circuits.",
            practical: true,
            updated: "2026-08-20"
          }
        ]
      },
      {
        number: 3,
        year: 2,
        label: "Semester 3",
        offerings: [
          {
            slug: "data-structures-and-algorithms",
            name: "Data Structures and Algorithms",
            code: "BE-R301",
            credits: 4,
            summary: "Students learn to select, implement, and evaluate data structures and algorithms through complexity analysis and programming exercises.",
            practical: true,
            updated: "2026-08-26"
          },
          {
            slug: "numerical-methods",
            name: "Numerical Methods",
            code: "BE-R302",
            credits: 3,
            summary: "Students apply numerical techniques to equations, interpolation, integration, and differential equations while examining approximation and error.",
            practical: true,
            updated: "2026-08-18"
          }
        ]
      },
      {
        number: 4,
        year: 2,
        label: "Semester 4",
        offerings: [
          {
            slug: "microprocessor-and-assembly-language",
            name: "Microprocessor and Assembly Language",
            code: "BE-R401",
            credits: 4,
            summary: "Students examine processor architecture, instruction execution, memory and I/O interfacing, interrupts, and assembly-language programming through practical exercises.",
            practical: true,
            updated: "2026-08-16"
          }
        ]
      },
      {
        number: 5,
        year: 3,
        label: "Semester 5",
        offerings: [
          {
            slug: "database-management-system",
            name: "Database Management System",
            code: "BE-R501",
            credits: 3,
            summary: "The subject moves from conceptual data modelling to normalization, SQL, transactions, indexing, and reliable database-backed applications.",
            practical: true,
            updated: "2026-08-25"
          },
          {
            slug: "computer-networking",
            name: "Computer Networking",
            code: "BE-R502",
            credits: 4,
            summary: "The subject develops a working understanding of TCP/IP, subnetting, switching, routing, network services, packet analysis, and troubleshooting.",
            practical: true,
            updated: "2026-08-28"
          }
        ]
      },
      {
        number: 6,
        year: 3,
        label: "Semester 6",
        offerings: [
          {
            slug: "compiler-design",
            name: "Compiler Design",
            code: "BE-R601",
            credits: 3,
            summary: "The subject follows a source program through lexical analysis, parsing, semantic analysis, intermediate-code generation, and optimization.",
            practical: true,
            updated: "2026-08-12"
          },
          {
            slug: "cryptography",
            name: "Cryptography",
            code: "BE-R602",
            credits: 3,
            summary: "Students study encryption, hashing, digital signatures, authentication, and key exchange, with attention to their use in protecting modern systems.",
            practical: true,
            updated: "2026-08-27"
          }
        ]
      },
      {
        number: 7,
        year: 4,
        label: "Semester 7",
        offerings: [
          {
            slug: "cybersecurity-fundamentals",
            name: "Cybersecurity Fundamentals",
            code: "BE-R701",
            credits: 3,
            summary: "Students examine common threats and defensive controls through access management, secure configuration, web security, threat modelling, and practical labs.",
            practical: true,
            updated: "2026-08-29"
          },
          {
            slug: "iot-and-embedded-systems",
            name: "IoT and Embedded Systems",
            code: "BE-R702",
            credits: 4,
            summary: "Students design small connected systems using sensors, microcontrollers, communication protocols, data collection, and dashboard-based monitoring.",
            practical: true,
            updated: "2026-08-23"
          }
        ]
      },
      {
        number: 8,
        year: 4,
        label: "Semester 8",
        offerings: [
          {
            slug: "research-methodology",
            name: "Research Methodology",
            code: "BE-R801",
            credits: 3,
            summary: "Students learn to frame researchable questions, review literature critically, select appropriate methods, analyse evidence, and report findings with proper citation and ethical practice.",
            practical: false,
            updated: "2026-08-21"
          },
          {
            slug: "quantum-computing",
            name: "Quantum Computing",
            code: "BE-R802",
            credits: 3,
            summary: "An introduction to qubits, superposition, entanglement, quantum gates, circuits, and selected algorithms, supported by simulation exercises.",
            practical: true,
            updated: "2026-08-14"
          }
        ]
      }
    ]
  }
] as const satisfies readonly AcademicProgram[];

export const allOfferings: readonly RoutedCourseOffering[] = academicPrograms.flatMap(
  (program) =>
    program.semesters.flatMap((semester) =>
      semester.offerings.map((offering) => ({
        ...offering,
        programSlug: program.slug,
        programName: program.name,
        programShortName: program.shortName,
        semesterNumber: semester.number,
        semesterLabel: semester.label,
        route: `/subjects/${program.slug}/semester-${semester.number}/${offering.slug}` as OfferingRoute
      }))
    )
);

export function getProgram(slug: string): AcademicProgram | undefined {
  return academicPrograms.find((program) => program.slug === slug);
}

export function getOffering(
  programSlug: string,
  semesterNumber: number,
  subjectSlug: string
): RoutedCourseOffering | undefined {
  return allOfferings.find(
    (offering) =>
      offering.programSlug === programSlug &&
      offering.semesterNumber === semesterNumber &&
      offering.slug === subjectSlug
  );
}
