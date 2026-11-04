import React from "react";
import { skeleton, tableCell, tableRow } from "components/ub/recipes";

interface TableSkeletonRowsProps {
  columns: number;
  rows?: number;
}

/** Placeholder rows at the real row height (56px) so nothing shifts when data arrives. */
export default function TableSkeletonRows({ columns, rows = 5 }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className={tableRow} aria-hidden="true">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className={tableCell}>
              <div className={`h-4 ${skeleton}`} style={{ width: colIndex === 0 ? "70%" : "50%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
