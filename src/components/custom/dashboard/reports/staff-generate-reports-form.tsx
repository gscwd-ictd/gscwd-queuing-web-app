"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { useReportsStore } from "@/lib/store/dashboard/useReportsStore";
import { staffReportFormSchema } from "@/lib/schemas/dashboard/reports/reportFormSchema";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ServiceType } from "@prisma/client";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function StaffGenerateReportForm() {
  const { setFilters } = useReportsStore();
  const [open, setOpen] = useState(false);

  const { data: serviceTypes } = useQuery<ServiceType[]>({
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
    refetchOnWindowFocus: false,
  });

  const form = useForm<z.infer<typeof staffReportFormSchema>>({
    resolver: zodResolver(staffReportFormSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      reportType: undefined,
      serviceType: "all",
    },
  });

  const onSubmit = (data: z.infer<typeof staffReportFormSchema>) => {
    setFilters({
      startDate: data.startDate,
      endDate: data.endDate,
      reportType: data.reportType,
      serviceType: data.serviceType === "all" ? undefined : data.serviceType,
    });

    form.reset({
      startDate: undefined,
      endDate: undefined,
      reportType: undefined,
      serviceType: undefined,
    });
  };

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-row items-start gap-4"
      >
        <div className="flex flex-row gap-2 items-start">
          <div className="flex flex-row gap-4 items-start">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <div className="flex flex-col items-start gap-1">
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="sm"
                            variant={"outline"}
                            className={cn(
                              "w-[150px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={
                            endDate
                              ? (date) => isAfter(date, endDate)
                              : undefined
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <div className="flex flex-col items-start gap-1">
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="sm"
                            variant={"outline"}
                            className={cn(
                              "w-[150px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={
                            startDate
                              ? (date) => isBefore(date, startDate)
                              : undefined
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              control={form.control}
              name={"reportType"}
              render={({ field }) => (
                <div className="flex flex-col items-start gap-1">
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Report</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          size="sm"
                          className={cn(
                            "w-[200px]",
                            form.formState.errors.reportType
                              ? "border-red-500 focus:ring-red-500"
                              : ""
                          )}
                        >
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Report</SelectLabel>
                            <SelectItem value="detailed">
                              Detailed Report on Queuing
                            </SelectItem>
                            <SelectItem value="summary">
                              Summary Report on Queuing
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                  <FormMessage />
                </div>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <div className="flex flex-col items-start gap-1">
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Service Type</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="sm"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[200px] justify-between"
                          >
                            <span className="truncate max-w-[150px] text-left">
                              {field.value === "all"
                                ? "All Service Types"
                                : field.value
                                ? serviceTypes?.find(
                                    (st) => st.id === field.value
                                  )?.name ?? "Select service type..."
                                : "Select service type..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search service type..." />
                          <CommandList>
                            <CommandEmpty>No service type found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="all"
                                onSelect={() => {
                                  form.setValue("serviceType", "all");
                                  setOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === "all"
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                All Service Type
                              </CommandItem>
                              {serviceTypes?.map((serviceType: ServiceType) => (
                                <CommandItem
                                  key={serviceType.id}
                                  value={serviceType.name}
                                  onSelect={() => {
                                    form.setValue(
                                      "serviceType",
                                      serviceType.id
                                    );
                                    setOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === serviceType.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {serviceType.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                  <FormMessage />
                </div>
              )}
            />
          </div>

          <Button type="submit" size="sm">
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
