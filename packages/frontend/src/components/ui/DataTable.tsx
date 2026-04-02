'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  getId?: (item: T) => string;
  // Pagination
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

function Skeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/6" />
          <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/5" />
          <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/6" />
          <div className="h-4 bg-gray-200 rounded-md animate-pulse w-1/8" />
        </div>
      ))}
    </div>
  );
}

export function DataTable<T>({
  columns, data, loading, emptyMessage = 'No data found', emptyIcon,
  selectable, selectedIds = [], onSelect, getId = (item: any) => item.id,
  page, totalPages, total, onPageChange,
}: DataTableProps<T>) {

  const toggleSelect = (id: string) => {
    if (!onSelect) return;
    onSelect(
      selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]
    );
  };

  const toggleAll = () => {
    if (!onSelect) return;
    onSelect(selectedIds.length === data.length ? [] : data.map(getId));
  };

  if (loading) return <Skeleton />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200/80">
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                </th>
              )}
              {columns.map(col => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider', col.className)}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon || <Inbox className="w-10 h-10 text-gray-300" />}
                    <p className="text-sm text-gray-400 font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const id = getId(item);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id || idx}
                    className={cn(
                      'hover:bg-gray-50/80 transition-colors duration-150',
                      isSelected && 'bg-indigo-50/50'
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className={cn('px-4 py-3.5 text-sm', col.className)}>
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200/80">
          <p className="text-sm text-gray-500">
            {total !== undefined && <span className="font-medium text-gray-700">{total}</span>}
            {total !== undefined && ' results · '}
            Page <span className="font-medium text-gray-700">{page}</span> of{' '}
            <span className="font-medium text-gray-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, (page || 1) - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, (page || 1) + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
