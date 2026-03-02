import { UserSessionWithCounter } from "@/lib/types/prisma/userSession"
import { ColumnDef } from "@tanstack/react-table"
import { format, toZonedTime } from "date-fns-tz"
import { RemoveUserSessionModal } from "../remove-user-session-modal"

const UserSessionColumnsActions = ({
  userWithCounter,
}: {
  userWithCounter: UserSessionWithCounter
}) => {
  return (
    <div className="flex space-x-2">
      <RemoveUserSessionModal userWithCounter={userWithCounter} />
    </div>
  )
}

export const userSessionColumns: ColumnDef<UserSessionWithCounter>[] = [
  {
    id: "counter",
    header: "Counter",
    accessorFn: (row) => `${row.counter.name} (${row.counter.code})`,
    cell: ({ row }) => {
      const counter = row.original.counter
      return `${counter.name} (${counter.code})`
    },
  },
  {
    id: "user",
    header: "User",
    accessorFn: (row) => `${row.user.firstName} ${row.user.lastName}`,
    cell: ({ row }) => {
      const user = row.original.user
      return `${user.firstName} ${user.lastName}`
    },
  },
  {
    id: "expiresAt",
    header: "Expires At",
    accessorFn: (row) => {
      const date = row.expiresAt
      if (!date) return "N/A"

      const timeZone = "Asia/Manila"
      const zonedDate = toZonedTime(new Date(date), timeZone)
      const pattern = "yyyy-MM-dd HH:mm:ss 'GMT'xxx"

      return format(zonedDate, pattern, { timeZone })
    },
    cell: ({ row }) => {
      const date = row.original.expiresAt
      if (!date) return "N/A"

      const timeZone = "Asia/Manila"
      const zonedDate = toZonedTime(new Date(date), timeZone)
      const pattern = "yyyy-MM-dd HH:mm:ss 'GMT'xxx"

      return format(zonedDate, pattern, { timeZone })
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const userWithCounter = row.original
      return <UserSessionColumnsActions userWithCounter={userWithCounter} />
    },
  },
]
