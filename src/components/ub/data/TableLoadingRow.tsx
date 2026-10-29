import React from "react";
import Loading from "components/ub/feedback/Loading";

interface TableLoadingRowProps {
  colSpan: number;
  text?: string;
}

export default function TableLoadingRow({ colSpan, text }: TableLoadingRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <Loading text={text} size={32} />
      </td>
    </tr>
  );
}
