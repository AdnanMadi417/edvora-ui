import React from "react";
import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "utils/passwordValidation";

interface PasswordRequirementsChecklistProps {
  password: string;
  className?: string;
}

/** Live pass/fail feedback for each password rule as the user types —
 *  derives entirely from PASSWORD_REQUIREMENTS, so it can never list a
 *  rule that isn't actually enforced. Renders nothing until the user has
 *  actually started typing, so an untouched field doesn't open with a
 *  wall of unmet requirements. */
const PasswordRequirementsChecklist = ({ password, className = "" }: PasswordRequirementsChecklistProps) => {
  if (!password) return null;

  return (
    <ul aria-live="polite" aria-label="Password requirements" className={`mb-4 -mt-2 flex flex-col gap-1 ${className}`}>
      {PASSWORD_REQUIREMENTS.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <li key={key} className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600" : "text-slate-400"}`}>
            {met ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirementsChecklist;
