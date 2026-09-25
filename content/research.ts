import type { ResearchInterest, ResearchProject } from "./types";
export const researchInterests: ResearchInterest[] = [
  {
    title: "Quantum computing",
    description:
      "Foundational quantum concepts, circuit simulation and approachable undergraduate learning.",
  },
  {
    title: "Artificial intelligence",
    description:
      "Applied machine learning projects with clear questions, suitable data and measurable evaluation.",
  },
  {
    title: "Cybersecurity",
    description:
      "Understanding system risks, defensive controls and responsible security practice.",
  },
  {
    title: "Computer networks",
    description:
      "Network design, configuration, troubleshooting and performance analysis.",
  },
  {
    title: "Internet of Things",
    description:
      "Sensor-based prototypes that connect embedded devices with useful data and dashboards.",
  },
  {
    title: "Computing education",
    description:
      "Practical tools and teaching approaches that support learning, assessment and feedback.",
  },
];
// Add only owner-verified projects; interests above are not claims of published results.
export const researchProjects: ResearchProject[] = [];
