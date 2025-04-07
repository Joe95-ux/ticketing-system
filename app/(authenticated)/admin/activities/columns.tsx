"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActivityWithRelations } from "@/lib/activities";

export const columns: ColumnDef<ActivityWithRelations>[] = [
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => format(new Date(row.original.createdAt), "PPp"),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => row.original.user.name || row.original.user.email,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => row.original.action.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" "),
  },
  {
    accessorKey: "ticket",
    header: "Ticket",
    cell: ({ row }) => row.original.ticket?.title || "N/A",
  },
]; 