import React from "react";
import { LucideIcon } from "lucide-react";

interface CardHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  bordered?: boolean;
}

const CardHeader: React.FC<CardHeaderProps> = ({
                                                 title,
                                                 description,
                                                 icon: Icon,
                                                 iconBg = "bg-gray-50",
                                                 iconColor = "text-gray-700",
                                                 bordered = true,
                                               }) => {
  return (
    <div
      className={`flex items-start gap-4 p-6 ${
        bordered ? "border-b border-gray-100" : ""
      }`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${iconBg}`}
      >
        <Icon className={`h-7 w-7 ${iconColor}`} />
      </div>

      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardHeader;
