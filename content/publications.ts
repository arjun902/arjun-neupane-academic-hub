import type { Publication } from "./types";
import { mastersThesis } from "./projects";
// The thesis is documented by the owner's résumé, not a journal/conference claim.
export const publications: Publication[] = [
  {
    id: "msc-quantum-state-fidelity",
    title: mastersThesis.title,
    authors: ["Arjun Neupane"],
    venue: mastersThesis.institution!,
    year: 2025,
    type: "Master's thesis",
    topics: ["Quantum information", "Entanglement swapping"],
  },
];
