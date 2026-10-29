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
 *  wall of unmet requirements. Met rules turn success-toned with a check;
 *  the icon (not just the colour) carries the state. */
const PasswordRequirementsChecklist = ({ password, className = "" }: PasswordRequirementsChecklistProps) => {
  if (!password) return null;

  return (
    <ul aria-live="polite" aria-label="Password requirements" className={`-mt-2 mb-4 flex flex-col gap-1 ${className}`}>
      {PASSWORD_REQUIREMENTS.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <li key={key} className={`flex items-center gap-1.5 text-ub-body-sm ${met ? "text-ub-tone-success-text" : "text-ub-text-tertiary"}`}>
            {met ? (
              <Check aria-hidden="true" strokeWidth={2} className="h-4 w-4 shrink-0" />
            ) : (
              <X aria-hidden="true" strokeWidth={2} className="h-4 w-4 shrink-0" />
            )}
            <span>{label}</span>
            <span className="sr-only">{met ? "(met)" : "(not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default PasswordRequirementsChecklist;
