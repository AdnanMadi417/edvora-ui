import type { ComponentType } from "react";
import BrandColors from "./BrandColors";
import Typography from "./Typography";
import Foundations from "./Foundations";
import { Buttons, Badges } from "./Actions";
import Forms from "./Forms";
import Navigation from "./Navigation";
import Feedback from "./Feedback";
import DataDisplay from "./DataDisplay";
import Handoff from "./Handoff";

export interface GuideSection {
  id: string;
  number: string;
  label: string;
  Component: ComponentType;
}

/** The style guide's table of contents, in page order. */
export const SECTIONS: GuideSection[] = [
  { id: "brand", number: "01", label: "Brand identity and colors", Component: BrandColors },
  { id: "typography", number: "02", label: "Typography", Component: Typography },
  { id: "foundations", number: "03", label: "Foundations", Component: Foundations },
  { id: "buttons", number: "04", label: "Buttons", Component: Buttons },
  { id: "forms", number: "05", label: "Form inputs", Component: Forms },
  { id: "navigation", number: "06", label: "Navigation", Component: Navigation },
  { id: "feedback", number: "07", label: "Feedback", Component: Feedback },
  { id: "badges", number: "08", label: "Content", Component: Badges },
  { id: "data", number: "10", label: "Data display", Component: DataDisplay },
  { id: "handoff", number: "14", label: "Developer handoff", Component: Handoff },
];
