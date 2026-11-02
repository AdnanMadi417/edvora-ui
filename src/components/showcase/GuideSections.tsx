"use client";

// Sections 04–11 of the style guide. Each one gathers demos from the
// component showcase files with <Pick>, so a demo is written once and shown
// in the section where people will look for it.

import { Pick, ShowcaseSection } from "./Showcase";
import { Buttons as LegacyButtons, Badges } from "./Actions";
import Forms from "./Forms";
import Navigation from "./Navigation";
import Feedback from "./Feedback";
import DataDisplay from "./DataDisplay";
import NewCoreForms from "./NewCoreForms";
import NewData from "./NewData";
import NewNavigationFeedback from "./NewNavigationFeedback";
import NewBrand from "./NewBrand";
import NewScreenParts from "./NewScreenParts";
import ApplicationKit from "./ApplicationKit";
import PopupForms from "./PopupForms";
import TableOptions from "./TableOptions";
import ApplicationFormDemo from "./ApplicationFormDemo";
import { ApplicationDetailsDemo } from "./ApplicationDetailsPattern";

export function ButtonsSection() {
  return (
    <ShowcaseSection
      id="buttons"
      number="04"
      title="Buttons"
      description="Buttons trigger actions. Use one Primary button per view, label it verb + object, and never put more than three buttons in a row. Every button is a pill."
    >
      <Pick demos={["Button", "IconButton", "PillButton", "NextButton / PrevButton", "LinkBtn", "ApproveRejectToggle", "ActionsDropdown"]}>
        <LegacyButtons />
      </Pick>
      <Pick demos={["TextButton", "ButtonGroup"]}>
        <NewCoreForms />
      </Pick>
    </ShowcaseSection>
  );
}

export function FormInputsSection() {
  return (
    <ShowcaseSection
      id="forms"
      number="05"
      title="Form inputs"
      description="Every input shares the same look, validation and error handling: label above, helper text below, 40px fields (48 on mobile), and errors that say how to fix the problem. Optional fields are marked, required ones are not."
    >
      <Pick demos={["Input", "Textarea", "Checkbox", "Radio and RadioGroup", "Toggle", "Stepper", "Combobox", "FileUpload"]}>
        <NewCoreForms />
      </Pick>
      <Pick demos={["InputField and TextareaField","SelectField, SelectInput and RadioField","CheckBoxGroup and CheckSimpleBoxGroup","SearchableDropdown, MultiSelect and SearchableSelect","Toggles","Password and OTP","Phone, commission and fee rows","IntakeDatePicker","RichTextEditor","RadioCardGroup","SearchableChecklist","File uploads"]}>
        <Forms />
      </Pick>
    </ShowcaseSection>
  );
}

export function NavigationSection() {
  return (
    <ShowcaseSection
      id="navigation"
      number="06"
      title="Navigation"
      description="Components that help people move around: switching views, knowing where they are, paging through results and narrowing them down."
    >
      <Pick demos={["AppShell", "Sidebar and NavbarTop", "PageHeader"]}>
        <NewScreenParts />
      </Pick>
      <Pick demos={["Tabs", "StatsFilterCards", "ApplicationFilterBar", "SearchInput, FilterSelectField, SortControl", "NavLink"]}>
        <Navigation />
      </Pick>
      <Pick demos={["Breadcrumbs", "Pagination", "NavbarBottom"]}>
        <NewNavigationFeedback />
      </Pick>
      <Pick demos={["StickyActionBar"]}>
        <ApplicationKit />
      </Pick>
      <Pick demos={["StepIndicator"]}>
        <ApplicationFormDemo />
      </Pick>
      <Pick demos={["PageContainer", "PublicNavbar", "Footer (portal)", "SiteFooter (public)"]}>
        <DataDisplay />
      </Pick>
    </ShowcaseSection>
  );
}

export function FeedbackSection() {
  return (
    <ShowcaseSection
      id="feedback"
      number="07"
      title="Feedback"
      description="Components that tell people what is happening: confirmations, warnings, progress and empty results. Status updates are announced politely to screen readers."
    >
      <Pick demos={["Alert", "ProgressBar", "EmptyState"]}>
        <NewNavigationFeedback />
      </Pick>
      <Pick demos={["NotificationItem"]}>
        <NewScreenParts />
      </Pick>
      <Pick demos={["Toast", "Loading", "AsyncStateView", "Empty states"]}>
        <Feedback />
      </Pick>
    </ShowcaseSection>
  );
}

export function ContentSection() {
  return (
    <ShowcaseSection
      id="content"
      number="08"
      title="Content"
      description="Building blocks for showing people, statuses and short hints: avatars, tags, badges, tooltips, dates and icons. Tags are 6px and always carry text, so color is never the only signal."
    >
      <Pick demos={["Avatar and AvatarGroup", "Tag", "DaysTag", "Chip", "CountBadge"]}>
        <NewData />
      </Pick>
      <Pick demos={["StageTag"]}>
        <NewScreenParts />
      </Pick>
      <Pick demos={["StatusBadge", "SolidBadge", "DetailStatusBadge", "SectionIconBadge", "FilterChip"]}>
        <Badges />
      </Pick>
      <Pick demos={["VerifiedBadge", "VerificationStamp"]}>
        <NewBrand />
      </Pick>
      <Pick demos={["Tooltip", "Skeleton"]}>
        <Feedback />
      </Pick>
      <Pick demos={["AppDate", "RichTextDisplay", "FadeIn"]}>
        <DataDisplay />
      </Pick>
      <Pick demos={["Icon"]}>
        <NewCoreForms />
      </Pick>
      <ApplicationDetailsDemo />
    </ShowcaseSection>
  );
}

export function PopupsSection() {
  return (
    <ShowcaseSection
      id="popups"
      number="09"
      title="Popups and dialogs"
      description="Popups pause the page for a focused task, a confirmation or a result. Focus moves in and is trapped, Esc closes, and focus returns to what opened it. In dialogs the Primary comes last."
    >
      <Pick demos={["Modal", "Drawer", "ActionSheet", "ContextMenu"]}>
        <NewNavigationFeedback />
      </Pick>
      <Pick demos={["Dropdown", "ModalHeader"]}>
        <DataDisplay />
      </Pick>
      <Pick demos={["MilestoneMoment"]}>
        <NewBrand />
      </Pick>
      <Pick demos={["FormModal", "Review Advisor popup"]}>
        <PopupForms />
      </Pick>
    </ShowcaseSection>
  );
}

export function DataDisplaySection() {
  return (
    <ShowcaseSection
      id="data"
      number="10"
      title="Data display"
      description="Components for presenting information in cards, lists and trackers. Resting cards use a border, not a shadow; glass is for summaries only."
    >
      <Pick demos={["ApplicationTracker"]}>
        <NewBrand />
      </Pick>
      <Pick demos={["StatCard", "List and ListItem"]}>
        <NewData />
      </Pick>
      <Pick demos={["PipelineBar", "DescriptionList"]}>
        <NewScreenParts />
      </Pick>
      <Pick demos={["SectionCard", "KeyValueGrid", "FileRow", "Timeline"]}>
        <ApplicationKit />
      </Pick>
      <Pick demos={["Card, Widget and PresignedImage", "CourseList", "Faq"]}>
        <DataDisplay />
      </Pick>
      <Pick demos={["GlassPanel", "NotchedCard"]}>
        <NewBrand />
      </Pick>
    </ShowcaseSection>
  );
}

export function TablesSection() {
  return (
    <ShowcaseSection
      id="tables"
      number="11"
      title="Tables"
      description="Tables for managing records: sorting, selecting rows and acting on them in bulk. Rows are 56px (44px compact), amounts are right-aligned with tabular numerals, and below 768px rows stack."
    >
      <Pick demos={["Table: Standard", "Table: Selectable", "Table: Card list", "DataTableToolbar"]}>
        <TableOptions />
      </Pick>
      <Pick demos={["DataTable"]}>
        <NewData />
      </Pick>
      <Pick demos={["Table kit"]}>
        <DataDisplay />
      </Pick>
      <Pick demos={["TablePagination"]}>
        <Navigation />
      </Pick>
    </ShowcaseSection>
  );
}
