import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>{children}</tbody>;
};

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  highlighted = false 
}) => {
  return (
    <tr className={`${highlighted ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors ${className}`}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  header = false 
}) => {
  if (header) {
    return (
      <th
        className={`px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
      >
        {children}
      </th>
    );
  }

  return (
    <td className={`px-4 md:px-6 py-4 whitespace-nowrap text-sm ${className}`}>
      {children}
    </td>
  );
};

// Main Table component with compound pattern
interface TableComponent extends React.FC<TableProps> {
  Header: typeof TableHeader;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Cell: typeof TableCell;
}

const TableBase: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto table-container">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
};

const Table = TableBase as TableComponent;
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;
