import React from "react";
import { Check, X } from "lucide-react";

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
  className?: string;
}

/** Live "do these match" feedback while typing the confirmation field.
 *  Renders nothing until the user has typed something to compare — warning
 *  tone (not danger) for "not yet matching", since danger is reserved for the
 *  authoritative blur/submit error on the field itself. */
const PasswordMatchIndicator = ({ password, confirmPassword, className = "" }: PasswordMatchIndicatorProps) => {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <p
      aria-live="polite"
      className={`-mt-2 mb-4 flex items-center gap-1.5 text-ub-body-sm ${matches ? "text-ub-tone-success-text" : "text-ub-tone-warning-text"} ${className}`}
    >
      {matches ? (
        <Check aria-hidden="true" strokeWidth={2} className="h-4 w-4 shrink-0" />
      ) : (
        <X aria-hidden="true" strokeWidth={2} className="h-4 w-4 shrink-0" />
      )}
      <span>{matches ? "Passwords match" : "Passwords do not match"}</span>
    </p>
  );
};

export default PasswordMatchIndicator;
