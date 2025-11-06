"use client";

import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types/prisma/user";
import { Role } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { UsersActionMenuDialog } from "./users-action-menu-dialog";
import { Department } from "@/lib/types/prisma/department";

export const usersColumns: ColumnDef<
  User & { fullName: string } & { department: Department }
>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      const user = row.original;
      return `${user.firstName} ${user.lastName}`;
    },
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "department.name",
    header: "Department",
  },
  {
    accessorKey: "email",
    header: "Email Address",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <>
          {role === Role.admin ? (
            <Badge className="bg-blue-900">Admin</Badge>
          ) : role === Role.superuser ? (
            <Badge className="bg-blue-700">Superuser</Badge>
          ) : (
            <Badge className="bg-blue-500">User</Badge>
          )}
        </>
      );
    },
  },
  {
    accessorKey: "allowedRoutes",
    header: "Allowed Routes",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return <UsersActionMenuDialog user={user} key={user.id} />;
    },
  },
];
