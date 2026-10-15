import React from "react";
import { Check, X } from "lucide-react";

interface PasswordMatchIndicatorProps {
  password: string;
  confirmPassword: string;
  className?: string;
}

/** Live "do these match" feedback while typing the confirmation field.
 *  Renders nothing until the user has typed something to compare — amber
 *  (not red) for "not yet matching", since red is reserved for the
 *  authoritative blur/submit error on the field itself. */
const PasswordMatchIndicator = ({ password, confirmPassword, className = "" }: PasswordMatchIndicatorProps) => {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;

  return (
    <p
      aria-live="polite"
      className={`mb-4 -mt-2 flex items-center gap-1.5 text-xs ${matches ? "text-emerald-600" : "text-amber-600"} ${className}`}
    >
      {matches ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
      <span>{matches ? "Passwords match" : "Passwords do not match"}</span>
    </p>
  );
};

export default PasswordMatchIndicator;
