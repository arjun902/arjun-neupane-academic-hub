import type { ResearchProject } from "./types";

export const mastersThesis: ResearchProject = {
  title: "Bounds for the Quantum State Fidelity after Entanglement Swapping",
  description:
    "MSc thesis in Information and Communication Engineering, focused on bounds for quantum state fidelity after entanglement swapping.",
  status: "Master's thesis",
  period: "2025",
  institution: "Pulchowk Campus, Tribhuvan University",
};

export const processorProject: ResearchProject = {
  title: "16-bit Microprocessor Design",
  description:
    "Designed and implemented a custom 16-bit microprocessor in VHDL on FPGA. The bachelor's capstone project received the Best Project Award at the 2018 National FPGA Competition, organised by Logitronix Nepal.",
  status: "Bachelor's capstone · Award-winning project",
  period: "October 2017 – December 2018",
  institution: "Nepal Engineering College, Pokhara University",
};

export const spaceSchoolProject: ResearchProject = {
  title: "Winter Space School – Pico Satellite Design",
  description:
    "Served as system design lead and designed subsystems for a stratospheric balloon payload, gaining practical experience in space-system engineering.",
  status: "System design lead · Winter Space School",
  period: "January 2020",
  institution: "Skolkovo Institute of Science and Technology, Russia",
};

export const researchProjects = [
  mastersThesis,
  processorProject,
  spaceSchoolProject,
];
