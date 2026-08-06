import React from "react";

interface TableSkeletonRowsProps {
  columns: number;
  rows?: number;
}

export default function TableSkeletonRows({ columns, rows = 5 }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div
                className="h-4 animate-pulse rounded bg-slate-200"
                style={{ width: colIndex === 0 ? "70%" : "50%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
