import React from "react";
import Loading from "components/loading/Loading";

interface TableLoadingRowProps {
  colSpan: number;
  text?: string;
}

export default function TableLoadingRow({ colSpan, text }: TableLoadingRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center">
        <Loading text={text} />
      </td>
    </tr>
  );
}
