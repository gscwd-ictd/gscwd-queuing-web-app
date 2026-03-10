"use client"

import { AddTransactionModal } from "@/components/custom/dashboard/transactions/add-transaction-modal"
import { TransactionsComponent } from "@/components/custom/dashboard/transactions/data-table/transactions-component"
import { Role } from "@prisma/client"
import { useSession } from "next-auth/react"

export default function Transactions() {
  const { data: session } = useSession()

  return (
    <>
      <h1 className="text-xl font-semibold">Transactions</h1>
      <div className="mt-6">
        {session && session.user?.role === Role.admin ? (
          <AddTransactionModal />
        ) : null}
        <TransactionsComponent />
      </div>
    </>
  )
}
