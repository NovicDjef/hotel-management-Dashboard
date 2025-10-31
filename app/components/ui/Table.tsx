import React from 'react';
import { clsx } from 'clsx';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={clsx(
            'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

export const TableHeader: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className, ...props }) => (
  <thead
    className={clsx('bg-gray-50 dark:bg-gray-800', className)}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ children, className, ...props }) => (
  <tbody
    className={clsx(
      'bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700',
      className
    )}
    {...props}
  >
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => (
  <tr
    className={clsx(
      'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<
  React.ThHTMLAttributes<HTMLTableCellElement>
> = ({ children, className, ...props }) => (
  <th
    className={clsx(
      'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
      className
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement>
> = ({ children, className, ...props }) => (
  <td
    className={clsx(
      'px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100',
      className
    )}
    {...props}
  >
    {children}
  </td>
);
