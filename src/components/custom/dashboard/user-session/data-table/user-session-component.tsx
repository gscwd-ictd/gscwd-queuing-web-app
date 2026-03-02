"use client"

import { Suspense } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { userSessionColumns } from "./user-session-columns"
import { UserSessionDataTable } from "./user-session-data-table"
import { UserSessionWithCounter } from "@/lib/types/prisma/userSession"

export function UserSessionComponent() {
  const { data: userSession, isLoading } = useQuery<UserSessionWithCounter[]>({
    queryKey: ["get-all-user-session"],
    queryFn: async () => {
      try {
        const response = await axios.get<UserSessionWithCounter[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/user-session`,
        )
        if (response.data.length === 0) {
          toast.info("Info", { description: "No user session found" })
        } else {
          toast.success("Success", {
            description: "User session fetched successfully",
          })
        }
        return response.data
      } catch (error) {
        toast.error("Error fetching user session", { description: `${error}` })
        return []
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <div className="p-2 h-full">
          <UserSessionDataTable
            columns={userSessionColumns}
            data={userSession ?? []}
            loading={isLoading}
          />
        </div>
      </Suspense>
    </>
  )
}
