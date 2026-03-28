import React from "react";
import { LucideIcon, Plane, X, XCircle } from 'lucide-react';

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

                                                   iconBg = "bg-gray-50",
                                                   iconColor = "text-gray-700",
                                                   iconBorder = "border-gray-200",

                                                   titleColor = "text-gray-900",
                                                   descriptionColor = "text-slate-600",

                                                   onClose,
                                                 }) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 py-5 px-4">

      <div className="flex items-start gap-4">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border ${iconBg} ${iconBorder}`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>

        <div>
          <h3 className={`text-lg font-semibold sm:text-lg ${titleColor}`}>
            {title}
          </h3>

          {description && (
            <p className={`mt-1 text-caption ${descriptionColor}`}>
              {description}
            </p>
          )}

        </div>
      </div>

      {onClose && (

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="group flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
        >
          <XCircle className="h-5 w-5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
};

export default ModalHeader;
