import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BadgeCheck,
  BarChart3,
  Blocks,
  BookOpenCheck,
  BrainCircuit,
  Braces,
  CalendarPlus,
  ClipboardCheck,
  Code2,
  Cpu,
  Database,
  Download,
  Figma,
  FileText,
  FlaskConical,
  GitBranch,
  GraduationCap,
  HelpCircle,
  LibraryBig,
  ListChecks,
  Megaphone,
  MessageSquareText,
  Microscope,
  Network,
  PackageCheck,
  Presentation,
  Router,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sigma,
  TrendingUp,
  Upload,
  UploadCloud,
  UsersRound,
  Wrench
} from "lucide-react";

export type Subject = {
  name: string;
  slug: string;
  program: string;
  semester: string;
  resources: string;
  summary: string;
  icon: LucideIcon;
};

export const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Programs", "/subjects"],
  ["Grading", "/grading"],
  ["Notices", "/notices"],
  ["Research", "/research"],
  ["Workshops", "/workshops"],
  ["Blog", "/blog"],
  ["Contact", "/contact"]
] as const;

export const profile = {
  name: "Er. Arjun Neupane",
  headline: "Computer Engineer, Assistant Professor, Researcher, and Academic Mentor",
  linkedinUrl: "https://www.linkedin.com/in/er-arjun-neupane/",
  githubUrl: "https://github.com/arjun902/arjun-neupane-academic-hub",
  photo: "/assets/arjun-neupane-profile.png",
  location: "Kathmandu, Nepal",
  summary:
    "Arjun Neupane is a computer engineer and educator with training in electrical, electronic, communication, and computing systems. He teaches BCA, BSc CSIT, and BE students and supports their laboratory work, projects, and research.",
  backgroundHighlights: [
    "MSc in Information and Communication Engineering with distinction.",
    "Academic training at the Institute of Engineering, Pulchowk Campus, Tribhuvan University.",
    "Teaching and mentoring experience in computing, engineering, networking, research methods, and project-based courses."
  ],
  currentRoles: [
    {
      institution: "Kathmandu Model College",
      role: "Assistant Professor / Lecturer",
      focus: "Teaches technology-related courses and supports students through classwork, practical sessions, and academic advising."
    },
    {
      institution: "National College of Computer Studies (NCCS)",
      role: "Assistant Professor / Lecturer",
      focus: "Teaches computer science and information technology courses, including laboratory work, assignments, and student projects."
    },
    {
      institution: "Kathmandu Business Campus",
      role: "Assistant Professor",
      focus: "Teaches applied computing and supports students with research preparation and academic work."
    },
    {
      institution: "Ambition Academy",
      role: "Lecturer / Academic Mentor",
      focus: "Teaches technology courses and supports workshops, examinations, and student mentoring."
    }
  ]
} as const;

export const subjects: Subject[] = [
  {
    name: "C Programming",
    slug: "c-programming",
    program: "BCA / CSIT / BE",
    semester: "Semester 1 in CSIT/BE; Semester 2 in BCA",
    resources: "Notes, lab sheets, assignments, viva sets",
    summary: "Students learn to translate problems into structured C programs through practice with control flow, functions, arrays, pointers, files, and debugging.",
    icon: Code2
  },
  {
    name: "Digital Logic",
    slug: "digital-logic",
    program: "BCA / CSIT / BE",
    semester: "Semester 1 or 2, depending on program",
    resources: "Boolean algebra notes, logic gate labs, K-map practice, old questions",
    summary: "This subject connects number systems and Boolean algebra with the design and analysis of combinational and sequential circuits.",
    icon: Blocks
  },
  {
    name: "Microprocessor and Assembly Language",
    slug: "microprocessor-and-assembly-language",
    program: "CSIT / BE",
    semester: "Semester 4 or 5, depending on program",
    resources: "Architecture notes, instruction sets, assembly labs, viva sets",
    summary: "Students examine processor architecture, instruction execution, memory and I/O interfacing, interrupts, and assembly-language programming through practical exercises.",
    icon: Cpu
  },
  {
    name: "Java Programming",
    slug: "java-programming",
    program: "BCA / CSIT",
    semester: "Semester 3 or 4, depending on program",
    resources: "Slides, OOP labs, question bank",
    summary: "The subject develops object-oriented programming skills through classes, interfaces, exception handling, collections, and small applications.",
    icon: Braces
  },
  {
    name: "Data Structures and Algorithms",
    slug: "data-structures-and-algorithms",
    program: "BCA / CSIT / BE",
    semester: "Semester 3",
    resources: "Unit notes, solved problems, old questions",
    summary: "Students learn to select, implement, and evaluate data structures and algorithms through complexity analysis and programming exercises.",
    icon: Network
  },
  {
    name: "Computer Networking",
    slug: "computer-networking",
    program: "BCA / CSIT / BE",
    semester: "Semester 5",
    resources: "Topology labs, subnetting sheets, packet analysis",
    summary: "The subject develops a working understanding of TCP/IP, subnetting, switching, routing, network services, packet analysis, and troubleshooting.",
    icon: Router
  },
  {
    name: "Cryptography",
    slug: "cryptography",
    program: "CSIT / BE",
    semester: "Semester 6",
    resources: "Classical ciphers, symmetric encryption, public key cryptography, hash functions, digital signatures",
    summary: "Students study encryption, hashing, digital signatures, authentication, and key exchange, with attention to their use in protecting modern systems.",
    icon: ShieldCheck
  },
  {
    name: "Compiler Design",
    slug: "compiler-design",
    program: "CSIT / BE",
    semester: "Semester 6",
    resources: "Lexical analysis notes, parsing exercises, syntax-directed translation, optimization examples",
    summary: "The subject follows a source program through lexical analysis, parsing, semantic analysis, intermediate-code generation, and optimization.",
    icon: Braces
  },
  {
    name: "Quantum Computing",
    slug: "quantum-computing",
    program: "BCA / CSIT / BE",
    semester: "Semester 8",
    resources: "Qubit basics, quantum gates, circuits, algorithms, simulation notebooks",
    summary: "An introduction to qubits, superposition, entanglement, quantum gates, circuits, and selected algorithms, supported by simulation exercises.",
    icon: Atom
  },
  {
    name: "Numerical Methods",
    slug: "numerical-methods",
    program: "BCA / CSIT / BE",
    semester: "Semester 2, 3, or 4, depending on program",
    resources: "Formula sheets, MATLAB/Python labs, solutions",
    summary: "Students apply numerical techniques to equations, interpolation, integration, and differential equations while examining approximation and error.",
    icon: Sigma
  },
  {
    name: "Database Management System",
    slug: "database-management-system",
    program: "BCA / CSIT / BE",
    semester: "Semester 4 or 5, depending on program",
    resources: "SQL labs, ER models, assignments",
    summary: "The subject moves from conceptual data modelling to normalization, SQL, transactions, indexing, and reliable database-backed applications.",
    icon: Database
  },
  {
    name: "Cybersecurity Fundamentals",
    slug: "cybersecurity-fundamentals",
    program: "BCA / CSIT / BE",
    semester: "Semester 6 or 7, depending on program",
    resources: "Checklists, labs, threat models",
    summary: "Students examine common threats and defensive controls through access management, secure configuration, web security, threat modelling, and practical labs.",
    icon: ShieldCheck
  },
  {
    name: "IoT and Embedded Systems",
    slug: "iot-and-embedded-systems",
    program: "CSIT / BE",
    semester: "Semester 7 or 8, depending on program",
    resources: "Sensor labs, project ideas, reports",
    summary: "Students design small connected systems using sensors, microcontrollers, communication protocols, data collection, and dashboard-based monitoring.",
    icon: Cpu
  },
  {
    name: "Research Methodology",
    slug: "research-methodology",
    program: "BCA / CSIT / BE",
    semester: "Semester 7 or 8, depending on program",
    resources: "Proposal templates, citation guides, paper support",
    summary: "Students learn to frame researchable questions, review literature critically, select appropriate methods, analyse evidence, and report findings with proper citation and ethical practice.",
    icon: BookOpenCheck
  }
];

export const notices = [
  {
    title: "Computer Networking laboratory submission deadline",
    type: "Lab notice",
    date: "2026-06-22",
    status: "Urgent",
    tone: "plum",
    body: "Submit the Packet Tracer file, completed subnetting sheet, and brief reflection before the internal assessment."
  },
  {
    title: "Research proposal review session for final-year students",
    type: "Research",
    date: "2026-06-19",
    status: "New",
    tone: "teal",
    body: "Students preparing a thesis, capstone, or paper may book a review session to discuss the research question, scope, and proposed method."
  },
  {
    title: "Java assignment feedback published",
    type: "Grading",
    date: "2026-06-17",
    status: "Published",
    tone: "green",
    body: "Rubric scores and comments on code structure are available in the student dashboard."
  },
  {
    title: "Registration open for the Git and GitHub workshop",
    type: "Workshop",
    date: "2026-06-14",
    status: "New",
    tone: "teal",
    body: "Priority will be given to project and internship students who are working in shared code repositories."
  }
];

export const workshops = [
  ["IoT Prototype Lab", "3 days", "BE / CSIT project students", "Develop a sensor-based system that records data and presents it on a simple dashboard.", Cpu],
  ["Cybersecurity Essentials", "2 days", "BCA / CSIT / BE", "Work through threat modelling, common web vulnerabilities, and basic defensive controls.", ShieldAlert],
  ["Git and GitHub Training", "1 day", "Project teams", "Learn to manage shared projects with commits, branches, pull requests, and code review.", GitBranch],
  ["Python and AI Bootcamp", "4 days", "Students", "Use Python notebooks to prepare data, explore datasets, and build introductory machine-learning models.", BrainCircuit],
  ["Research Paper Writing", "2 days", "Final year students", "Plan and revise a research paper with attention to argument, evidence, structure, and citation.", FileText],
  ["UI/UX and Figma Workshop", "2 days", "Software project groups", "Turn project requirements into accessible interface prototypes and a consistent set of components.", Figma]
].map(([title, duration, audience, outcome, icon]) => ({
  title: title as string,
  duration: duration as string,
  audience: audience as string,
  outcome: outcome as string,
  icon: icon as LucideIcon
}));

export const posts = [
  {
    title: "Preparing a BCA Project Proposal for Academic Review",
    category: "Project Ideas",
    description: "A guide to writing the problem statement, defining the scope, selecting a method, and planning the evaluation."
  },
  {
    title: "A Step-by-Step Approach to Subnetting",
    category: "Networking and Cybersecurity",
    description: "A worked method for calculating network ranges and checking subnetting answers in class, laboratory, and examination settings."
  },
  {
    title: "Object-Oriented Programming in Java for CSIT Students",
    category: "Programming Tutorials",
    description: "An explanation of classes, objects, inheritance, interfaces, and exceptions using classroom examples."
  },
  {
    title: "Structuring an IT Internship Report in Nepal",
    category: "Internship Report Writing",
    description: "Guidance on chapter structure, formatting, evidence from practical work, references, and viva preparation."
  },
  {
    title: "Starting Undergraduate Research in AI and Quantum Computing",
    category: "AI and Quantum Computing",
    description: "Suggestions for defining a manageable topic, beginning a literature review, and selecting suitable simulation tools."
  },
  {
    title: "A Revision Plan for Numerical Methods Internal Assessments",
    category: "BCA Notes",
    description: "A study sequence covering root finding, interpolation, numerical integration, and differential equations."
  }
];

export const featureIcons = {
  BadgeCheck,
  BarChart3,
  Blocks,
  CalendarPlus,
  ClipboardCheck,
  Download,
  FlaskConical,
  GraduationCap,
  HelpCircle,
  LibraryBig,
  ListChecks,
  Megaphone,
  MessageSquareText,
  Microscope,
  PackageCheck,
  Presentation,
  Search,
  TrendingUp,
  Upload,
  UploadCloud,
  UsersRound,
  Wrench,
  Atom
};
