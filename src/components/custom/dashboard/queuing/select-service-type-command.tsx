"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useQueuingTicketStore } from "@/lib/store/dashboard/useQueuingTicketStore";
import { Input } from "@/components/ui/input";
import { ServiceType } from "@/lib/types/prisma/serviceType";

export function SelectServiceTypeCommand() {
  const [open, setOpen] = useState(false);
  const {
    selectedServiceTypeId,
    setSelectedServiceTypeId,
    otherServiceType,
    setOtherServiceType,
  } = useQueuingTicketStore();

  const { data: serviceTypes, isLoading } = useQuery<ServiceType[]>({
    queryKey: ["get-all-service-types"],
    queryFn: async () => {
      try {
        const response = await axios.get<ServiceType[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/service-types`
        );
        if (response.data.length === 0) {
          toast.info("Info", {
            description: "No service types found",
          });
        } else {
          toast.success("Success", {
            description: "Service types fetched successfully",
          });
        }
        return response.data;
      } catch (error) {
        toast.error("Error fetching service types", {
          description: `${error}`,
        });
        return [];
      }
    },
    refetchOnMount: false,
  });

  const handleSelect = (serviceTypeId: string) => {
    setSelectedServiceTypeId(serviceTypeId);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading) {
      setOpen(false);
      return;
    }
    setOpen(newOpen);
  };

  // * For showing other service type input if "Others" option is selected"
  const isOthersOptionIsSelected =
    serviceTypes?.find(
      (serviceType) => serviceType.id === selectedServiceTypeId
    )?.name === "Others";

  return (
    <div className="flex flex-col gap-4">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className="flex flex-col gap-2">
            <Label className="text-md">Service Type</Label>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-10"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  Loading service types...
                </div>
              ) : selectedServiceTypeId ? (
                serviceTypes?.find(
                  (serviceType) => serviceType.id === selectedServiceTypeId
                )?.name
              ) : (
                "Select service type..."
              )}
              {!isLoading && <ChevronsUpDown className="opacity-50" />}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command className="w-full">
            <CommandInput placeholder="Search service type..." />
            <CommandList className="max-h-[170px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No service type found.</CommandEmpty>
                  <CommandGroup>
                    {serviceTypes &&
                      serviceTypes.map((serviceType) => (
                        <CommandItem
                          key={serviceType.id}
                          value={serviceType.name}
                          onSelect={(currentValue) => {
                            const selectedServiceType = serviceTypes.find(
                              (serviceType) => serviceType.name === currentValue
                            );
                            if (selectedServiceType) {
                              handleSelect(selectedServiceType.id);
                            }
                          }}
                        >
                          {serviceType.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              selectedServiceTypeId === serviceType.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isOthersOptionIsSelected && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="otherServiceType" className="text-md">
            Please specify other service type
          </Label>
          <Input
            id="otherServiceType"
            placeholder="Enter other service type"
            value={otherServiceType}
            onChange={(e) => setOtherServiceType(e.target.value)}
            required
          />
        </div>
      )}
    </div>
  );
}
