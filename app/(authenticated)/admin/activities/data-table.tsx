"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [actionFilter, setActionFilter] = React.useState<string>("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleExport = () => {
    // Get filtered and sorted data
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const rowData = row.original as any;
      return {
        Time: new Date(rowData.createdAt).toLocaleString(),
        User: rowData.user.name || rowData.user.email,
        Action: rowData.action.replace(/_/g, " "),
        Details: JSON.stringify(rowData.details),
        Ticket: rowData.ticket ? rowData.ticket.title : "N/A",
      };
    });

    // Convert to CSV
    const headers = ["Time", "User", "Action", "Details", "Ticket"];
    const csv = [
      headers.join(","),
      ...exportData.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof typeof row])
        ).join(",")
      )
    ].join("\n");

    // Download file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter by user..."
            value={(table.getColumn("user")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("user")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={actionFilter}
            onValueChange={(value) => {
              setActionFilter(value);
              table.getColumn("action")?.setFilterValue(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="added_comment">Comments</SelectItem>
              <SelectItem value="changed_status">Status Changes</SelectItem>
              <SelectItem value="changed_priority">Priority Changes</SelectItem>
              <SelectItem value="assigned_ticket">Assignments</SelectItem>
              <SelectItem value="resolved_ticket">Resolutions</SelectItem>
              <SelectItem value="closed_ticket">Closures</SelectItem>
              <SelectItem value="reopened_ticket">Reopens</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="ml-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 