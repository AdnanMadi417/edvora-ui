import type { ComponentType } from "react";
import BrandColors from "./BrandColors";
import Typography from "./Typography";
import Foundations from "./Foundations";
import {
  ButtonsSection,
  FormInputsSection,
  NavigationSection,
  FeedbackSection,
  ContentSection,
  PopupsSection,
  DataDisplaySection,
  TablesSection,
} from "./GuideSections";
import SignInScreens from "./SignInScreens";
import DashboardPatterns from "./DashboardPatterns";
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
  { id: "buttons", number: "04", label: "Buttons", Component: ButtonsSection },
  { id: "forms", number: "05", label: "Form inputs", Component: FormInputsSection },
  { id: "navigation", number: "06", label: "Navigation", Component: NavigationSection },
  { id: "feedback", number: "07", label: "Feedback", Component: FeedbackSection },
  { id: "content", number: "08", label: "Content", Component: ContentSection },
  { id: "popups", number: "09", label: "Popups and dialogs", Component: PopupsSection },
  { id: "data", number: "10", label: "Data display", Component: DataDisplaySection },
  { id: "tables", number: "11", label: "Tables", Component: TablesSection },
  { id: "auth", number: "12", label: "Sign-in screens", Component: SignInScreens },
  { id: "dashboard", number: "13", label: "Dashboard patterns", Component: DashboardPatterns },
  { id: "handoff", number: "14", label: "Developer handoff", Component: Handoff },
];
