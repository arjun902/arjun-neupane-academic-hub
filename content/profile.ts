import type { Profile } from "./types";
import { mastersThesis, processorProject } from "./projects";

// Owner-provided résumé is the primary source for roles and dates.
// LinkedIn supplements certifications; reconciliation notes are in docs/PROFILE_SOURCES.md.
export const profile: Profile = {
  name: "Arjun Neupane",
  headline: "Lecturer · Electronics & Communication Engineer · Researcher",
  location: "Kathmandu, Nepal",
  summary:
    "Arjun Neupane is a lecturer and electronics and communication engineer with an MSc in Information and Communication Engineering, awarded with distinction by Pulchowk Campus, Tribhuvan University. He teaches BCA and CSIT courses, develops practical learning materials and assessment rubrics, and mentors student projects. His academic and engineering work spans quantum information, FPGA processor design and space systems.",
  email: "arjunneupane433@gmail.com",
  photo: "/assets/arjun-neupane-profile.webp",
  education: [
    {
      degree: "MSc in Information and Communication Engineering",
      institution: "Pulchowk Campus, Tribhuvan University",
      period: "April 2023 – June 2025",
      distinction: "Distinction",
      project: `Thesis: ${mastersThesis.title}`,
    },
    {
      degree: "BE in Electronics and Communication Engineering",
      institution: "Nepal Engineering College, Pokhara University",
      period: "2013 – 2018",
      project: `Project: ${processorProject.title}`,
    },
  ],
  experience: [
    {
      institution: "Trinity International College",
      role: "Lecturer – CSIT Program",
      period: "February 2026 – Present",
      location: "Kathmandu, Nepal",
      category: "Teaching",
      current: true,
      subjects: ["Cryptography", "E-Governance"],
      focus:
        "Delivers curriculum-aligned lectures and practical activities, develops learning materials, conducts continuous assessment and provides academic guidance.",
    },
    {
      institution: "National College of Computer Studies (NCCS)",
      role: "Lecturer – CSIT Program",
      period: "November 2025 – Present",
      location: "Kathmandu, Nepal",
      category: "Teaching",
      current: true,
      subjects: ["Cryptography", "Advanced Java Programming", "Digital Logic"],
      focus:
        "Develops lesson plans and assessment rubrics, conducts practical labs, guides academic projects and mentors students.",
    },
    {
      institution: "Kathmandu Business Campus",
      role: "Lecturer – BCA Program",
      period: "August 2025 – Present",
      location: "Kathmandu, Nepal",
      category: "Teaching",
      current: true,
      subjects: ["Numerical Methods", "Network Administration"],
      focus:
        "Connects course concepts with practical teaching and hands-on exercises.",
    },
    {
      institution: "Everest College of Management",
      role: "Lecturer – BCA Program",
      period: "August 2025 – Present",
      location: "Thapathali, Kathmandu, Nepal",
      category: "Teaching",
      current: true,
      subjects: ["Numerical Methods"],
      focus:
        "Develops and delivers lectures that connect numerical techniques to real-world applications.",
    },
    {
      institution: "Kathmandu Model College",
      role: "Lecturer – BCA Program",
      period: "July 2024 – Present",
      location: "Kathmandu, Nepal",
      category: "Teaching",
      current: true,
      subjects: [
        "Microprocessor",
        "C Programming",
        "Numerical Methods",
        "Computer Networking",
        "Digital Logic",
      ],
      focus:
        "Designs lesson plans and assessment rubrics, conducts practical labs, guides academic projects and mentors students.",
    },
    {
      institution: "Holy Vision Higher Secondary School",
      role: "Computer Science Instructor – Grades 11 & 12",
      period: "February 2023 – April 2024",
      location: "Kathmandu, Nepal",
      category: "Teaching",
      current: false,
      subjects: ["Computer Science"],
      focus:
        "Delivered NEB curriculum-aligned lessons and assessed students through theory and practical examinations.",
    },
    {
      institution: "Aarogya Construction Pvt. Ltd.",
      role: "Electronics and Communication Engineer",
      period: "October 2019 – January 2023",
      location: "Lalitpur, Nepal",
      category: "Engineering",
      current: false,
      focus:
        "Managed engineering design, documentation and quality control, and coordinated technical planning with internal teams and vendors.",
    },
    {
      institution: "Digitronix Nepal",
      role: "FPGA Engineer",
      period: "February 2018 – June 2019",
      location: "Kathmandu, Nepal",
      category: "Engineering",
      current: false,
      focus:
        "Designed a 16-bit microprocessor in VHDL and implemented it on FPGA, trained junior engineers and contributed to FPGA research.",
    },
  ],
  links: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/er-arjun-neupane/" },
    {
      label: "GitHub",
      url: "https://github.com/arjun902/arjun-neupane-academic-hub",
    },
  ],
  certifications: [
    {
      title:
        "Build a Modern Computer from First Principles: From Nand to Tetris (Project-Centered Course)",
      issuer: "Coursera Course Certificates",
      issued: "May 2020",
      credentialId: "6MPGUC48AMPH",
    },
    {
      title: "Machine Learning",
      issuer: "Coursera Course Certificates",
      issued: "May 2020",
      credentialId: "9XMCJB7LF5LM",
    },
    {
      title: "Robotics: Aerial Robotics",
      issuer: "Coursera Course Certificates",
      issued: "May 2020",
      credentialId: "JTVM7QE3KG42",
    },
  ],
  skills: [
    { title: "Languages", items: ["C", "Python", "VHDL", "SQL"] },
    {
      title: "Tools",
      items: ["MATLAB", "ModelSim", "Quartus", "Packet Tracer", "Git"],
    },
    {
      title: "Engineering platforms",
      items: ["FPGA", "Embedded systems", "Satellite systems"],
    },
    {
      title: "Teaching practice",
      items: [
        "Curriculum planning",
        "Lesson plan design",
        "Rubric development",
        "Student mentoring",
      ],
    },
  ],
  achievements: [
    {
      title: "Best Project Award – National FPGA Competition",
      year: "2018",
      description:
        "Awarded by Logitronix Nepal for a custom 16-bit microprocessor developed in VHDL and verified on FPGA.",
    },
  ],
  snapshot: [
    {
      title: "Academic background",
      description:
        "MSc in Information and Communication Engineering, with distinction — Pulchowk Campus.",
    },
    {
      title: "Teaching & mentoring",
      description:
        "BCA and CSIT lecturing, practical laboratories, assessment design and student projects.",
    },
    {
      title: "Research & engineering",
      description:
        "Quantum state fidelity, FPGA processor design and space-system prototyping.",
    },
  ],
};
