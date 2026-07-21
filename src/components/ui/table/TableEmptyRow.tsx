import React from "react";
import NoMessagesFound from "components/emptyData/NoMessagesFound";

interface TableEmptyRowProps {
  colSpan: number;
  title?: string;
  subtitle?: string;
}

export default function TableEmptyRow({ colSpan, title, subtitle }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <NoMessagesFound title={title} subtitle={subtitle} />
      </td>
    </tr>
  );
}
