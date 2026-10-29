import React from "react";
import { LucideIcon, X } from "lucide-react";
import { buttonBase, buttonVariants, iconButtonSizes } from "components/ub/recipes";

interface ModalHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;

  iconBg?: string;
  iconColor?: string;
  iconBorder?: string;

  titleColor?: string;
  descriptionColor?: string;

  onClose?: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  description,
  icon: Icon,

  iconBg = "bg-ub-surface-subtle",
  iconColor = "text-ub-icon",
  iconBorder = "border-ub-border",

  titleColor = "text-ub-text-primary",
  descriptionColor = "text-ub-text-secondary",

  onClose,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ub-border px-4 py-5 md:px-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-ub-lg border ${iconBg} ${iconBorder}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden />
        </div>

        <div className="min-w-0">
          <h3 className={`text-ub-heading-md ${titleColor}`}>{title}</h3>

          {description && <p className={`mt-1 text-ub-body-sm ${descriptionColor}`}>{description}</p>}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className={`${buttonBase} ${iconButtonSizes.md} shrink-0 p-0 ${buttonVariants.tertiary} text-ub-icon`}
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      )}
    </div>
  );
};

export default ModalHeader;
