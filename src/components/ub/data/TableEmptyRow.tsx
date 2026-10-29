import React from "react";
import NoMessagesFound from "components/ub/feedback/NoMessagesFound";

interface TableEmptyRowProps {
  colSpan: number;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function TableEmptyRow({ colSpan, title, subtitle, action, icon }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 pb-8 text-center">
        <NoMessagesFound title={title} subtitle={subtitle} icon={icon} />
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </td>
    </tr>
  );
}
