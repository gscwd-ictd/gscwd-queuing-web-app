"use client";

import { MonthlyQueuingTicketsCompletedChart } from "@/components/custom/dashboard/home/charts/monthly-queuing-tickets-completed-chart";
import { MonthlyServiceTypesChart } from "@/components/custom/dashboard/home/charts/monthly-service-types-chart";
import { UserProfileCard } from "@/components/custom/dashboard/home/user-profile-card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

type ChartsData = {
  monthlyServiceTypes: {
    serviceType: string;
    total: number;
  }[];
  monthlyQueuingTickets: {
    date: string;
    regularLane: number;
    specialLane: number;
  }[];
};

export default function Home() {
  const { data: session } = useSession();

  const userProfile = {
    firstName: session?.user.firstName,
    lastName: session?.user.lastName,
    nameExtension: session?.user.nameExtension,
    position: session?.user.position,
    counterId: session?.user.counterId,
    imageUrl: session?.user.imageUrl,
  };

  const { data } = useQuery<ChartsData>({
    queryKey: ["get-charts-data"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-data/charts`
      );
      return res.data;
    },
  });

  return (
    <>
      <h1 className="text-xl font-semibold">Home</h1>
      <div className="flex flex-col flex-1 overflow-auto min-h-0 mt-6">
        <div className="grid grid-cols-3 grid-rows-3 flex-1 gap-2 h-full">
          <div className="row-start-1 col-start-1 flex flex-col items-center justify-center">
            <UserProfileCard userProfile={userProfile} />
          </div>

          <div className="row-start-1 col-start-2 col-span-2 flex flex-col items-center justify-center">
            <MonthlyServiceTypesChart
              chartsData={data?.monthlyServiceTypes ?? []}
            />
          </div>

          <div className="row-start-2 col-start-1 col-span-3 row-span-2 flex flex-col items-center justify-center">
            <MonthlyQueuingTicketsCompletedChart
              chartsData={data?.monthlyQueuingTickets ?? []}
            />
          </div>
        </div>
      </div>
    </>
  );
}
