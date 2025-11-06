import { User } from "@/lib/types/prisma/user";
import { ColumnDef } from "@tanstack/react-table";

export const personnelColumns: ColumnDef<
  Pick<
    User,
    | "id"
    | "firstName"
    | "middleName"
    | "lastName"
    | "nameExtension"
    | "email"
    | "position"
  >
>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => {
      const { firstName, middleName, lastName, nameExtension } = row.original;

      const fullName = [
        firstName,
        middleName,
        lastName,
        nameExtension ? `(, ${nameExtension})` : null,
      ]
        .filter(Boolean)
        .join(" ");

      return <span>{fullName}</span>;
    },
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "email",
    header: "E-mail Address",
  },
];
