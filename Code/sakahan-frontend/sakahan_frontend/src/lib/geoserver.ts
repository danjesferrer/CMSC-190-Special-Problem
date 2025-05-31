import { type ClassificationType } from "@/types";

export const getGridcodes = (classifications: ClassificationType[]) => {
  const gridcodes = classifications
    .filter((classification) => classification.selected)
    .map((classification) => classification.gridcode);

  if (gridcodes.length === 0) return null;

  return `gridcode IN (${gridcodes.join(", ")})`;
};
