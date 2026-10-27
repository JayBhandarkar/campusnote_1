import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-20 bg-slate-200 rounded-full" />
        <div className="h-5 w-24 bg-slate-200 rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-1/2 bg-slate-100 rounded mb-4" />
      <div className="h-3 w-full bg-slate-100 rounded mb-1" />
      <div className="h-3 w-4/5 bg-slate-100 rounded mb-4" />
    </div>
    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="h-4 w-28 bg-slate-200 rounded" />
      <div className="h-8 w-20 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="animate-pulse border-b border-slate-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-slate-200 rounded w-full max-w-[120px]" />
      </td>
    ))}
  </tr>
);
