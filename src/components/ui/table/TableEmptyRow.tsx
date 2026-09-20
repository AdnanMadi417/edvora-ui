import React from "react";
import NoMessagesFound from "components/emptyData/NoMessagesFound";

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
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <NoMessagesFound title={title} subtitle={subtitle} icon={icon} />
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </td>
    </tr>
  );
}
