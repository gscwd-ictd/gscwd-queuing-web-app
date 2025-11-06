"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type UserProfile = {
  firstName?: string;
  lastName?: string;
  nameExtension?: string;
  position?: string;
  counterId?: string;
  imageUrl?: string;
};

type UserProfileCardProps = {
  userProfile: UserProfile;
};

export function UserProfileCard({ userProfile }: UserProfileCardProps) {
  const { data: counter } = useQuery({
    queryKey: ["get-counter-by-counter-id"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST}/api/counters/${userProfile.counterId}`
      );
      return data;
    },

    enabled: !!userProfile?.counterId,
  });

  return (
    <Card className="flex flex-col gap-12 items-start h-full w-full p-6">
      <p className="font-medium text-xl">Welcome!</p>
      <div className="lg:flex lg:flex-row sm:flex sm:flex-col gap-6 w-full">
        <Avatar className="lg:h-24 lg:w-24 md:w-14 md:h-14 sm:h-10 sm:w-10">
          <AvatarImage
            src={`${process.env.NEXT_PUBLIC_EMPLOYEE_AVATARS}/${
              userProfile.imageUrl ?? ""
            }`}
          />
          <AvatarFallback className="bg-gray-500 text-white lg:text-xl">
            {userProfile.firstName ? userProfile.firstName.charAt(0) : "Q"}
            {userProfile.lastName ? userProfile.lastName.charAt(0) : "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start h-full gap-2 w-full">
          <div>
            <p className="lg:text-lg md:text-md sm:text-sm font-semibold">
              {userProfile.firstName ?? "First Name"}{" "}
              {userProfile.lastName ?? "Last Name"}
              {userProfile.nameExtension
                ? `, ${userProfile.nameExtension}`
                : ""}
            </p>
            {userProfile.position ? (
              <p className="text-xs md:text-sm lg:text-md">
                {userProfile.position}
              </p>
            ) : null}
          </div>
          {counter ? <Badge className="text-md">{counter.name}</Badge> : null}
        </div>
      </div>
    </Card>
  );
}
