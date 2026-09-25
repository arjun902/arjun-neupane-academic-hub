import type { Resource } from "./types";
// External links point to the publisher; no third-party documents are rehosted.
export const resources: Resource[] = [
  {
    id: "c-pointer-lab",
    subject: "c-programming",
    programs: ["bca"],
    semesters: [2],
    unit: "topic-2",
    title: "Pointer and structure lab sheets",
    description:
      "Two practical exercise sets covering pointers, dynamic allocation and structures. PDF, 1 page.",
    fileUrl:
      "/resources/bca/semester-2/c-programming/labs/pointer-and-structure-lab-sheets.pdf",
    credit: "Arjun Neupane teaching collection",
    tags: ["pointers", "structures", "arrays", "lab"],
    type: "Lab",
    status: "published",
  },
  {
    id: "discrete-mit",
    subject: "discrete-mathematics",
    title: "Mathematics for Computer Science",
    description:
      "MIT OpenCourseWare resources on proofs, discrete structures and probability.",
    externalUrl:
      "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/",
    credit: "MIT OpenCourseWare",
    tags: ["logic", "proofs", "graphs", "counting"],
    type: "Reference",
    status: "published",
  },
  {
    id: "c-reference",
    subject: "c-programming",
    title: "GNU C reference manual",
    description:
      "Language reference for declarations, expressions, functions and program structure.",
    externalUrl: "https://www.gnu.org/software/gnu-c-manual/gnu-c-manual.html",
    credit: "GNU",
    tags: ["syntax", "functions", "pointers", "arrays"],
    type: "Reference",
    status: "published",
  },
  {
    id: "logic-mit",
    subject: "digital-logic",
    title: "Computation Structures",
    description:
      "MIT OpenCourseWare materials exploring digital systems and computation.",
    externalUrl:
      "https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/",
    credit: "MIT OpenCourseWare",
    tags: ["gates", "circuits", "architecture"],
    type: "Reference",
    status: "published",
  },
  {
    id: "architecture-mit",
    subject: "microprocessor-and-assembly-language",
    title: "Computation Structures: architecture",
    description:
      "Study the relationship between logic, instruction execution and computer architecture.",
    externalUrl:
      "https://ocw.mit.edu/courses/6-004-computation-structures-spring-2017/",
    credit: "MIT OpenCourseWare",
    tags: ["processor", "memory", "instructions"],
    type: "Reference",
    status: "published",
  },
  {
    id: "java-learn",
    subject: "java-programming",
    title: "Learn Java",
    description:
      "Official learning material for the Java language and its core APIs.",
    externalUrl: "https://dev.java/learn/",
    credit: "Java / Oracle",
    tags: ["classes", "objects", "collections"],
    type: "Reference",
    status: "published",
  },
  {
    id: "algorithms-mit",
    subject: "data-structures-and-algorithms",
    title: "Introduction to Algorithms",
    description:
      "MIT course materials for algorithmic thinking and data structures.",
    externalUrl:
      "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/",
    credit: "MIT OpenCourseWare",
    tags: ["complexity", "sorting", "trees"],
    type: "Reference",
    status: "published",
  },
  {
    id: "wireshark",
    subject: "computer-networking",
    title: "Wireshark user guide",
    description:
      "Packet capture and analysis documentation for authorised network investigation.",
    externalUrl: "https://www.wireshark.org/docs/wsug_html_chunked/",
    credit: "Wireshark",
    tags: ["packets", "TCP/IP", "analysis"],
    type: "Reference",
    status: "published",
  },
  {
    id: "aes-nist",
    subject: "cryptography",
    title: "Advanced Encryption Standard",
    description:
      "The NIST specification for AES, a reference for studying symmetric encryption.",
    externalUrl: "https://csrc.nist.gov/pubs/fips/197/final",
    credit: "NIST",
    tags: ["AES", "encryption", "symmetric"],
    type: "Reference",
    status: "published",
  },
  {
    id: "llvm-tutorial",
    subject: "compiler-design",
    title: "Build a language frontend with LLVM",
    description:
      "A worked tutorial moving from a lexer and parser to code generation.",
    externalUrl: "https://llvm.org/docs/tutorial/",
    credit: "LLVM Project",
    tags: ["lexer", "parser", "code generation"],
    type: "Reference",
    status: "published",
  },
  {
    id: "quantum-ibm",
    subject: "quantum-computing",
    title: "IBM Quantum Learning",
    description:
      "Learning resources on quantum information, circuits and computation.",
    externalUrl: "https://learning.quantum.ibm.com/",
    credit: "IBM Quantum",
    tags: ["qubits", "gates", "circuits"],
    type: "Reference",
    status: "published",
  },
  {
    id: "scipy",
    subject: "numerical-methods",
    title: "SciPy user guide",
    description:
      "Examples of scientific computing methods, including optimisation, integration and interpolation.",
    externalUrl: "https://docs.scipy.org/doc/scipy/tutorial/",
    credit: "SciPy",
    tags: ["integration", "interpolation", "optimisation"],
    type: "Reference",
    status: "published",
  },
  {
    id: "postgres",
    subject: "database-management-system",
    title: "PostgreSQL tutorial",
    description:
      "An introduction to relational databases and SQL with practical examples.",
    externalUrl: "https://www.postgresql.org/docs/current/tutorial.html",
    credit: "PostgreSQL",
    tags: ["SQL", "relations", "transactions"],
    type: "Reference",
    status: "published",
  },
  {
    id: "owasp",
    subject: "cybersecurity-fundamentals",
    title: "Web Security Testing Guide",
    description:
      "OWASP guidance for structured security testing within an authorised scope.",
    externalUrl: "https://owasp.org/www-project-web-security-testing-guide/",
    credit: "OWASP",
    tags: ["web", "security", "testing"],
    type: "Reference",
    status: "published",
  },
  {
    id: "arduino",
    subject: "iot-and-embedded-systems",
    title: "Arduino learning resources",
    description:
      "Official introductions to hardware, programming and connected devices.",
    externalUrl: "https://docs.arduino.cc/learn/",
    credit: "Arduino",
    tags: ["sensors", "microcontrollers", "IoT"],
    type: "Reference",
    status: "published",
  },
  {
    id: "research-guide",
    subject: "research-methodology",
    title: "Planning a student research project",
    description:
      "A practical checklist for questions, evidence, methods and reporting.",
    fileUrl: "/students/#research",
    tags: ["proposal", "methods", "citation"],
    type: "Notes",
    status: "published",
  },
];
