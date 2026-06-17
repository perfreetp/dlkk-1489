import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T, index: number) => ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
}

export default function DataTable<T extends { id?: string }>({ 
  columns, 
  data, 
  loading = false, 
  emptyText = '暂无数据',
  rowClassName,
  onRowClick
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="table-container">
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-dark-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <div className="p-12 text-center">
          <p className="text-dark-400">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(column.className)}
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={cn(
                onRowClick && "cursor-pointer",
                rowClassName?.(row, index)
              )}
              onClick={() => onRowClick?.(row, index)}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className={column.className}>
                  {column.render 
                    ? column.render(row, index) 
                    : (row as Record<string, ReactNode>)[column.key as string]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
