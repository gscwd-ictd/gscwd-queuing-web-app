"use client";

import { ServedCustomerStats } from "@/components/custom/dashboard/queuing/served-customers-stats";
import { IncomingQueuingTicketsComponent } from "@/components/custom/dashboard/queuing/data-table/incoming-queuing-tickets/incoming-queuing-tickets-component";
import { RegularLaneQueuingTicketsComponent } from "@/components/custom/dashboard/queuing/data-table/regular-queuing-tickets/regular-lane-queuing-tickets-component";
import { SpecialLaneQueuingTicketsComponent } from "@/components/custom/dashboard/queuing/data-table/special-lane-queuing-tickets/special-lane-queuing-tickets-component";
import { TransferredQueuingTicketsComponent } from "@/components/custom/dashboard/queuing/data-table/transferred-queuing-tickets/transferred-queuing-tickets-component";
import { NowServingCustomerComponent } from "@/components/custom/dashboard/queuing/now-serving-customer/now-serving-customer-component";
import {
  getPaymentTransactionId,
  getTransactionIdsExceptPaymentId,
} from "@/lib/functions/dashboard/queuing/getTransactionIds";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function Queuing() {
  const session = useSession();

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ["get-user-stats"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-user-statistics`
      );
      return response.data;
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/transactions`
      );
      return data;
    },
  });

  const hasAccessToTransferFeature =
    session.data?.user?.assignedTransactionId &&
    getPaymentTransactionId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  const hasAccessToIncomingTickets =
    session.data?.user?.assignedTransactionId &&
    getTransactionIdsExceptPaymentId(transactions).includes(
      session.data.user.assignedTransactionId
    );

  return (
    <>
      <h1 className="text-xl font-semibold">Queuing</h1>
      <div className="flex flex-col flex-1 h-full mt-6">
        <div
          className="grid grid-cols-3 grid-rows-[auto_auto_auto] gap-2"
          style={{
            gridTemplateRows:
              "minmax(280px, auto) minmax(280px, auto) minmax(280px, auto)",
          }}
        >
          <div className="col-span-2">
            <RegularLaneQueuingTicketsComponent />
          </div>
          <div className="col-span-2">
            <SpecialLaneQueuingTicketsComponent />
          </div>
          <div className="row-span-2 row-start-1 col-start-3">
            <NowServingCustomerComponent />
          </div>
          {hasAccessToIncomingTickets && stats ? (
            <>
              <div className="row-start-3 col-span-2 col-start-1">
                <IncomingQueuingTicketsComponent />
              </div>
              <div className="row-start-3 col-start-3 col-span-1">
                <ServedCustomerStats
                  stats={stats}
                  loading={statsLoading}
                  error={statsError}
                />
              </div>
            </>
          ) : hasAccessToTransferFeature && stats ? (
            <>
              <div className="row-start-3 col-start-1 col-span-2">
                <TransferredQueuingTicketsComponent />
              </div>
              <div className="row-start-3 col-start-3 col-span-1">
                <ServedCustomerStats
                  stats={stats}
                  loading={statsLoading}
                  error={statsError}
                />
              </div>
            </>
          ) : (
            <>
              <div className="row-start-3 col-start-1 col-span-3">
                <ServedCustomerStats
                  stats={stats}
                  loading={statsLoading}
                  error={statsError}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
