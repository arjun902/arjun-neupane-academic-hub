import type { Course } from "./types";
export const courses: Course[] = [
  {
    slug: "discrete-mathematics",
    name: "Discrete Mathematics",
    summary: "Logic, proofs, counting and graph theory.",
    practical: false,
    units: [],
  },
  {
    slug: "c-programming",
    name: "C Programming",
    summary:
      "Students learn to translate problems into structured C programs through practice with control flow, functions, arrays, pointers, files, and debugging.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Foundations",
        topics: [
          "Types, expressions and input/output",
          "Selection, loops and tracing",
        ],
      },
      {
        id: "topic-2",
        title: "Functions & memory",
        topics: [
          "Functions, arrays and strings",
          "Pointers, allocation and structures",
        ],
      },
      {
        id: "topic-3",
        title: "Files & testing",
        topics: [
          "Text and binary file operations",
          "Boundary cases and error handling",
        ],
      },
    ],
  },
  {
    slug: "digital-logic",
    name: "Digital Logic",
    summary:
      "This subject connects number systems and Boolean algebra with the design and analysis of combinational and sequential circuits.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Representation",
        topics: [
          "Number systems and binary arithmetic",
          "Boolean algebra and truth tables",
        ],
      },
      {
        id: "topic-2",
        title: "Circuit design",
        topics: [
          "Combinational logic and simplification",
          "Sequential circuits and state",
        ],
      },
    ],
  },
  {
    slug: "numerical-methods",
    name: "Numerical Methods",
    summary:
      "Students apply numerical techniques to equations, interpolation, integration, and differential equations while examining approximation and error.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Approximation",
        topics: [
          "Floating-point error and convergence",
          "Root finding and linear systems",
        ],
      },
      {
        id: "topic-2",
        title: "Computation",
        topics: [
          "Interpolation and numerical integration",
          "Differential equations and validation",
        ],
      },
    ],
  },
  {
    slug: "data-structures-and-algorithms",
    name: "Data Structures and Algorithms",
    summary:
      "Students learn to select, implement, and evaluate data structures and algorithms through complexity analysis and programming exercises.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Data organisation",
        topics: [
          "Lists, stacks, queues and trees",
          "Representation and operation costs",
        ],
      },
      {
        id: "topic-2",
        title: "Algorithmic reasoning",
        topics: [
          "Searching, sorting and graph traversal",
          "Complexity and correctness",
        ],
      },
    ],
  },
  {
    slug: "java-programming",
    name: "Java Programming",
    summary:
      "The subject develops object-oriented programming skills through classes, interfaces, exception handling, collections, and small applications.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Language foundations",
        topics: [
          "Types, control flow and methods",
          "Classes, objects and encapsulation",
        ],
      },
      {
        id: "topic-2",
        title: "Applications",
        topics: [
          "Interfaces and polymorphism",
          "Exceptions, collections and testing",
        ],
      },
    ],
  },
  {
    slug: "database-management-system",
    name: "Database Management System",
    summary:
      "The subject moves from conceptual data modelling to normalization, SQL, transactions, indexing, and reliable database-backed applications.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Data modelling",
        topics: [
          "Relations, keys and constraints",
          "Normalisation and schema design",
        ],
      },
      {
        id: "topic-2",
        title: "Database practice",
        topics: [
          "Queries, joins and aggregation",
          "Transactions, indexes and reliability",
        ],
      },
    ],
  },
  {
    slug: "microprocessor-and-assembly-language",
    name: "Microprocessor and Assembly Language",
    summary:
      "Students examine processor architecture, instruction execution, memory and I/O interfacing, interrupts, and assembly-language programming through practical exercises.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Architecture",
        topics: [
          "Registers, buses and memory",
          "Instruction execution and addressing",
        ],
      },
      {
        id: "topic-2",
        title: "Programming & interfaces",
        topics: [
          "Assembly control flow and subroutines",
          "I/O interfacing and interrupts",
        ],
      },
    ],
  },
  {
    slug: "computer-networking",
    name: "Computer Networking",
    summary:
      "The subject develops a working understanding of TCP/IP, subnetting, switching, routing, network services, packet analysis, and troubleshooting.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Network foundations",
        topics: ["Layers, addressing and subnetting", "Switching and routing"],
      },
      {
        id: "topic-2",
        title: "Practice & analysis",
        topics: [
          "Transport and application protocols",
          "Packet analysis and troubleshooting",
        ],
      },
    ],
  },
  {
    slug: "compiler-design",
    name: "Compiler Design",
    summary:
      "The subject follows a source program through lexical analysis, parsing, semantic analysis, intermediate-code generation, and optimization.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Language frontends",
        topics: [
          "Lexical analysis and tokenisation",
          "Parsing and syntax trees",
        ],
      },
      {
        id: "topic-2",
        title: "Translation",
        topics: [
          "Semantic checks and intermediate representations",
          "Code generation and optimisation",
        ],
      },
    ],
  },
  {
    slug: "cryptography",
    name: "Cryptography",
    summary:
      "Students study encryption, hashing, digital signatures, authentication, and key exchange, with attention to their use in protecting modern systems.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Cryptographic building blocks",
        topics: [
          "Symmetric and public-key encryption",
          "Hashes and message authentication",
        ],
      },
      {
        id: "topic-2",
        title: "Protocols & trust",
        topics: [
          "Digital signatures and key exchange",
          "Threat models and correct implementation",
        ],
      },
    ],
  },
  {
    slug: "cybersecurity-fundamentals",
    name: "Cybersecurity Fundamentals",
    summary:
      "Students examine common threats and defensive controls through access management, secure configuration, web security, threat modelling, and practical labs.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Risk & controls",
        topics: [
          "Threat modelling and access control",
          "Secure configuration and data protection",
        ],
      },
      {
        id: "topic-2",
        title: "Defensive practice",
        topics: [
          "Authorised testing and evidence collection",
          "Remediation and responsible reporting",
        ],
      },
    ],
  },
  {
    slug: "research-methodology",
    name: "Research Methodology",
    summary:
      "Students learn to frame researchable questions, review literature critically, select appropriate methods, analyse evidence, and report findings with proper citation and ethical practice.",
    practical: false,
    units: [
      {
        id: "topic-1",
        title: "Planning inquiry",
        topics: [
          "Research questions and literature review",
          "Method selection and ethical practice",
        ],
      },
      {
        id: "topic-2",
        title: "Evidence & communication",
        topics: [
          "Analysis, limitations and reproducibility",
          "Academic writing and citation",
        ],
      },
    ],
  },
  {
    slug: "quantum-computing",
    name: "Quantum Computing",
    summary:
      "An introduction to qubits, superposition, entanglement, quantum gates, circuits, and selected algorithms, supported by simulation exercises.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Quantum information",
        topics: [
          "Qubits, states and measurement",
          "Superposition and entanglement",
        ],
      },
      {
        id: "topic-2",
        title: "Circuits & algorithms",
        topics: [
          "Quantum gates and circuit simulation",
          "Reasoning about algorithm outcomes",
        ],
      },
    ],
  },
  {
    slug: "iot-and-embedded-systems",
    name: "IoT and Embedded Systems",
    summary:
      "Students design small connected systems using sensors, microcontrollers, communication protocols, data collection, and dashboard-based monitoring.",
    practical: true,
    units: [
      {
        id: "topic-1",
        title: "Embedded foundations",
        topics: [
          "Sensors, actuators and microcontrollers",
          "Sampling and device programming",
        ],
      },
      {
        id: "topic-2",
        title: "Connected prototypes",
        topics: [
          "Communication protocols and data collection",
          "Reliability, privacy and system testing",
        ],
      },
    ],
  },
];
