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

export type Resource = {
  title: string;
  program: "BCA" | "CSIT" | "BE";
  semester: string;
  subject: string;
  type:
    | "Notes"
    | "Slides"
    | "Lab Reports"
    | "Assignments"
    | "Question Banks"
    | "Solutions"
    | "Project Guidelines"
    | "Internship Report Format"
    | "Research Paper Templates";
  downloads: number;
  updated: string;
};

export const navItems = [
  ["Home", "/"],
  ["About", "/about"],
  ["Subjects", "/subjects"],
  ["Materials", "/materials"],
  ["Grading", "/grading"],
  ["Notices", "/notices"],
  ["Research", "/research"],
  ["Workshops", "/workshops"],
  ["Blog", "/blog"],
  ["Contact", "/contact"]
] as const;

export const profile = {
  name: "Er. Arjun Neupane",
  headline: "Computer Engineer | Assistant Professor | Lecturer | Researcher | Academic Mentor",
  linkedinUrl: "https://www.linkedin.com/in/er-arjun-neupane/",
  photo: "/assets/arjun-neupane-profile.png",
  location: "Kathmandu, Nepal",
  summary:
    "Engineer and academic professional with a background in Electrical, Electronics, Communication, and applied computing. He teaches and mentors BCA, CSIT, and BE students through practical labs, structured resources, research guidance, and project supervision.",
  backgroundHighlights: [
    "MSc in Information and Communication Engineering with distinction.",
    "Institute of Engineering, Pulchowk Campus, Tribhuvan University academic background.",
    "Teaching and mentoring across computer science, information technology, engineering, networking, research, and project-based courses."
  ],
  currentRoles: [
    {
      institution: "Kathmandu Model College",
      role: "Assistant Professor / Lecturer",
      focus: "Classroom teaching, mentoring, and academic resource support for technology-focused learners."
    },
    {
      institution: "National College of Computer Studies (NCCS)",
      role: "Assistant Professor / Lecturer",
      focus: "Computer Science, Information Technology, lab practice, assignments, and student project guidance."
    },
    {
      institution: "Kathmandu Business Campus",
      role: "Assistant Professor",
      focus: "Applied computing, digital literacy, research orientation, and academic mentoring."
    },
    {
      institution: "Ambition Academy",
      role: "Lecturer / Academic Mentor",
      focus: "Technology education, student support, workshops, and exam-oriented preparation."
    }
  ]
} as const;

export const subjects: Subject[] = [
  {
    name: "C Programming",
    slug: "c-programming",
    program: "BCA / CSIT / BE",
    semester: "First year",
    resources: "Notes, lab sheets, assignments, viva sets",
    summary: "Foundational programming practice with syntax clarity, problem solving, and lab-ready examples.",
    icon: Code2
  },
  {
    name: "Digital Logic",
    slug: "digital-logic",
    program: "BCA / CSIT / BE",
    semester: "Foundation course",
    resources: "Boolean algebra notes, logic gate labs, K-map practice, old questions",
    summary: "Core computing foundation covering number systems, Boolean algebra, logic gates, combinational circuits, sequential circuits, and digital design basics.",
    icon: Blocks
  },
  {
    name: "Microprocessor and Assembly Language",
    slug: "microprocessor-and-assembly-language",
    program: "CSIT / BE",
    semester: "Core hardware course",
    resources: "Architecture notes, instruction sets, assembly labs, viva sets",
    summary: "Microprocessor architecture, instruction cycles, memory interfacing, interrupts, assembly programming, and hardware-level system understanding.",
    icon: Cpu
  },
  {
    name: "Java Programming",
    slug: "java-programming",
    program: "BCA / CSIT",
    semester: "Second year",
    resources: "Slides, OOP labs, question bank",
    summary: "Object-oriented programming, GUI basics, exception handling, collections, and project practice.",
    icon: Braces
  },
  {
    name: "Data Structures and Algorithms",
    slug: "data-structures-and-algorithms",
    program: "CSIT / BE",
    semester: "Core course",
    resources: "Unit notes, solved problems, old questions",
    summary: "Lists, stacks, queues, trees, graphs, hashing, sorting, complexity, and interview-level reasoning.",
    icon: Network
  },
  {
    name: "Computer Networking",
    slug: "computer-networking",
    program: "BCA / CSIT / BE",
    semester: "Mid semester",
    resources: "Topology labs, subnetting sheets, packet analysis",
    summary: "TCP/IP, routing, switching, addressing, services, security basics, and practical network design.",
    icon: Router
  },
  {
    name: "Numerical Methods",
    slug: "numerical-methods",
    program: "BCA / BE",
    semester: "Mathematics core",
    resources: "Formula sheets, MATLAB/Python labs, solutions",
    summary: "Root finding, interpolation, integration, differential equations, and error-aware computation.",
    icon: Sigma
  },
  {
    name: "Database Management System",
    slug: "database-management-system",
    program: "BCA / CSIT / BE",
    semester: "Core course",
    resources: "SQL labs, ER models, assignments",
    summary: "Relational modeling, normalization, SQL, transactions, indexing, and application-backed data design.",
    icon: Database
  },
  {
    name: "Cybersecurity Fundamentals",
    slug: "cybersecurity-fundamentals",
    program: "CSIT / BE",
    semester: "Elective / workshop",
    resources: "Checklists, labs, threat models",
    summary: "Secure systems thinking, authentication, web risks, cryptography basics, and defensive practice.",
    icon: ShieldCheck
  },
  {
    name: "IoT and Embedded Systems",
    slug: "iot-and-embedded-systems",
    program: "BE / Workshop",
    semester: "Project track",
    resources: "Sensor labs, project ideas, reports",
    summary: "Microcontrollers, sensors, data capture, cloud dashboards, and working prototype guidance.",
    icon: Cpu
  },
  {
    name: "Research Methodology",
    slug: "research-methodology",
    program: "BCA / CSIT / BE",
    semester: "Final year",
    resources: "Proposal templates, citation guides, paper support",
    summary: "Research questions, literature review, methodology, academic writing, and publication discipline.",
    icon: BookOpenCheck
  }
];

export const resources: Resource[] = [
  ["Computer Networking Subnetting Workbook", "CSIT", "4th", "Computer Networking", "Notes", 1290, "2026-06-18"],
  ["Java OOP Lab Sheet Pack", "BCA", "3rd", "Java Programming", "Lab Reports", 980, "2026-06-16"],
  ["C Programming Practical Questions", "BCA", "1st", "C Programming", "Question Banks", 1560, "2026-06-13"],
  ["Digital Logic Boolean Algebra and K-Map Notes", "CSIT", "1st", "Digital Logic", "Notes", 1180, "2026-06-28"],
  ["Microprocessor 8085 and Assembly Lab Pack", "BE", "4th", "Microprocessor and Assembly Language", "Lab Reports", 890, "2026-06-28"],
  ["DBMS ER Model and Normalization Slides", "BE", "5th", "Database Management System", "Slides", 720, "2026-06-12"],
  ["Numerical Methods Formula and Solution Set", "BCA", "2nd", "Numerical Methods", "Solutions", 1115, "2026-06-10"],
  ["Final Year Project Proposal Format", "CSIT", "8th", "Project Work", "Project Guidelines", 2120, "2026-06-08"],
  ["Internship Report Template", "BCA", "8th", "Internship Report", "Internship Report Format", 1840, "2026-06-05"],
  ["Research Paper IEEE Starter Template", "BE", "Final", "Research Methodology", "Research Paper Templates", 640, "2026-06-03"]
].map(([title, program, semester, subject, type, downloads, updated]) => ({
  title: title as string,
  program: program as Resource["program"],
  semester: semester as string,
  subject: subject as string,
  type: type as Resource["type"],
  downloads: downloads as number,
  updated: updated as string
}));

export const notices = [
  {
    title: "Computer Networking lab submission window closes this Friday",
    type: "Lab notice",
    date: "2026-06-22",
    status: "Urgent",
    tone: "plum",
    body: "Submit packet tracer files, subnetting sheet, and reflection notes before the internal evaluation cycle."
  },
  {
    title: "Research proposal clinic for final year students",
    type: "Research",
    date: "2026-06-19",
    status: "New",
    tone: "teal",
    body: "Students preparing thesis, capstone, or publication drafts can book a review slot for topic framing."
  },
  {
    title: "Java assignment feedback published",
    type: "Grading",
    date: "2026-06-17",
    status: "Published",
    tone: "green",
    body: "Rubric remarks are available in the student dashboard with improvement notes for code structure."
  },
  {
    title: "Git and GitHub training registration open",
    type: "Workshop",
    date: "2026-06-14",
    status: "New",
    tone: "teal",
    body: "Seats are prioritized for project and internship students working on collaborative repositories."
  }
];

export const workshops = [
  ["IoT Prototype Lab", "3 days", "BE / CSIT project students", "Build a sensor-driven data pipeline and dashboard.", Cpu],
  ["Cybersecurity Essentials", "2 days", "BCA / CSIT / BE", "Practice threat modeling, web risks, and defensive checklists.", ShieldAlert],
  ["Git and GitHub Training", "1 day", "Project teams", "Move from folder-based work to professional version control.", GitBranch],
  ["Python and AI Bootcamp", "4 days", "Technology learners", "Use Python notebooks for data handling and practical ML workflows.", BrainCircuit],
  ["Research Paper Writing", "2 days", "Final year students", "Structure a publishable paper with citations and review discipline.", FileText],
  ["UI/UX and Figma Workshop", "2 days", "Software project groups", "Translate requirements into usable interfaces and design systems.", Figma]
].map(([title, duration, audience, outcome, icon]) => ({
  title: title as string,
  duration: duration as string,
  audience: audience as string,
  outcome: outcome as string,
  icon: icon as LucideIcon
}));

export const posts = [
  {
    title: "How to Prepare a BCA Project Proposal That Survives Review",
    category: "Project Ideas",
    description: "A practical structure for problem statements, scope, methodology, timeline, and evaluation criteria.",
    read: "7 min read"
  },
  {
    title: "Computer Networking Notes: Subnetting Without Memorizing Tricks",
    category: "Networking and Cybersecurity",
    description: "A clear method for solving subnetting questions with reusable exam and lab patterns.",
    read: "9 min read"
  },
  {
    title: "Java OOP Concepts for CSIT Students",
    category: "Programming Tutorials",
    description: "Classes, objects, inheritance, interfaces, and exceptions explained through classroom examples.",
    read: "6 min read"
  },
  {
    title: "Internship Report Format for IT Students in Nepal",
    category: "Internship Report Writing",
    description: "Recommended chapter flow, formatting habits, screenshots, references, and viva preparation.",
    read: "8 min read"
  },
  {
    title: "AI and Quantum Computing: A Student-Friendly Research Map",
    category: "AI and Quantum Computing",
    description: "Entry points for literature review, simulation tools, and undergraduate research exploration.",
    read: "10 min read"
  },
  {
    title: "Old Questions to Practice Before Numerical Methods Internal Exams",
    category: "BCA Notes",
    description: "A preparation sequence for root finding, interpolation, integration, and differential equations.",
    read: "5 min read"
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
