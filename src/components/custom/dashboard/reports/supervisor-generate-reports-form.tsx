'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useReportsStore } from '@/lib/store/dashboard/useReportsStore';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useState } from 'react';
import { toast } from 'sonner';
import { supervisorReportFormSchema } from '@/lib/schemas/dashboard/reports/reportFormSchema';
import { User as Personnel } from '@/lib/types/prisma/user';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceType } from '@/lib/types/prisma/serviceType';
import { toZonedTime } from 'date-fns-tz';

export function SupervisorGenerateReportForm() {
  const { setReportParams } = useReportsStore(); // Changed from setFilters
  const [openPersonnelSelect, setOpenPersonnelSelect] = useState(false);
  const [openServiceTypeSelect, setOpenServiceTypeSelect] = useState(false);

  const TIMEZONE = 'Asia/Manila';

  const { data: personnel } = useQuery({
    queryKey: ['personnel-under-supervisor'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/users/get-all-users-by-supervisor`);
        if (response.data.length === 0) {
          toast.info('Info', { description: 'No personnel found' });
          return [];
        } else {
          toast.success('Success', {
            description: 'Personnel fetched successfully',
          });
          return response.data;
        }
      } catch (error) {
        toast.error('Error', { description: `${error}` });
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: serviceTypes } = useQuery<ServiceType[]>({
    queryKey: ['get-all-service-types'],
    queryFn: async () => {
      try {
        const response = await axios.get<ServiceType[]>(`${process.env.NEXT_PUBLIC_HOST}/api/service-types`);
        if (response.data.length === 0) {
          toast.info('Info', {
            description: 'No service types found',
          });
        } else {
          toast.success('Success', {
            description: 'Service types fetched successfully',
          });
        }
        return response.data;
      } catch (error) {
        toast.error('Error fetching service types', {
          description: `${error}`,
        });
        return [];
      }
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const form = useForm<z.infer<typeof supervisorReportFormSchema>>({
    resolver: zodResolver(supervisorReportFormSchema),
    defaultValues: {
      userId: 'all',
      startDate: undefined,
      endDate: undefined,
      reportType: undefined,
      serviceType: undefined,
    },
    mode: 'onSubmit',
  });

  const onSubmit = (data: z.infer<typeof supervisorReportFormSchema>) => {
    // Validate required fields
    if (!data.startDate || !data.endDate || !data.reportType) {
      toast.error('Validation Error', {
        description: 'Please fill in all required fields',
      });
      return;
    }

    // Set report parameters directly
    setReportParams({
      startDate: data.startDate,
      endDate: data.endDate,
      reportType: data.reportType,
      userId: data.userId === 'all' ? undefined : data.userId,
      serviceTypeId: data.serviceType === 'all' ? undefined : data.serviceType,
    });
  };

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row items-start gap-4">
        <div className="flex flex-row gap-2 items-start">
          <div className="flex flex-row gap-4 items-start">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <div className="flex flex-col items-start gap-1">
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Personnel</FormLabel>
                    <Popover open={openPersonnelSelect} onOpenChange={setOpenPersonnelSelect}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="sm"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPersonnelSelect}
                            className="w-[200px] justify-between"
                          >
                            <span className="truncate max-w-[150px] text-left">
                              {field.value === 'all'
                                ? 'All Personnel'
                                : field.value
                                ? personnel?.find((personnel: Personnel) => personnel.id === field.value)?.firstName +
                                  ' ' +
                                  personnel?.find((personnel: Personnel) => personnel.id === field.value)?.lastName
                                : 'Select personnel...'}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search personnel..." />
                          <CommandList>
                            <CommandEmpty>No personnel found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="all"
                                onSelect={() => {
                                  form.setValue('userId', 'all');
                                  setOpenPersonnelSelect(false);
                                }}
                              >
                                <Check
                                  className={cn('mr-2 h-4 w-4', field.value === 'all' ? 'opacity-100' : 'opacity-0')}
                                />
                                All Personnel
                              </CommandItem>
                              {personnel?.map((personnel: Personnel) => (
                                <CommandItem
                                  key={personnel.id}
                                  value={`${personnel.firstName} ${personnel.lastName}`.trim()}
                                  onSelect={() => {
                                    form.setValue('userId', personnel.id);
                                    setOpenPersonnelSelect(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value === personnel.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                  {personnel.firstName} {personnel.lastName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                </div>
              )}
            />

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
                            variant={'outline'}
                            className={cn(
                              'w-[150px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const manilaDate = toZonedTime(date, TIMEZONE);
                            const manilaNow = toZonedTime(new Date(), TIMEZONE);
                            const manilaToday = new Date(manilaNow);
                            manilaToday.setHours(0, 0, 0, 0);

                            // Disable if date is after today, but allow today
                            return isAfter(manilaDate, manilaToday);
                          }}
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
                            variant={'outline'}
                            className={cn(
                              'w-[150px] pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={startDate ? (date) => isBefore(date, startDate) : undefined}
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
              name={'reportType'}
              render={({ field }) => (
                <div className="flex flex-row items-center gap-1">
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel>Report</FormLabel>
                    <FormControl>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <SelectTrigger
                          size="sm"
                          className={cn(
                            'w-[200px]',
                            form.formState.errors.reportType ? 'border-red-500 focus:ring-red-500' : ''
                          )}
                        >
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Report</SelectLabel>
                            <SelectItem value="detailed">Detailed Report on Queuing</SelectItem>
                            {/* <SelectItem value="summary">
                            Summary Report on Queuing
                          </SelectItem> */}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                  {/* <FormMessage /> */}
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
                    <Popover open={openServiceTypeSelect} onOpenChange={setOpenServiceTypeSelect}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size="sm"
                            variant="outline"
                            role="combobox"
                            aria-expanded={openServiceTypeSelect}
                            className="w-[200px] justify-between"
                          >
                            <span className="truncate max-w-[150px] text-left">
                              {field.value === 'all'
                                ? 'All Service Types'
                                : field.value
                                ? serviceTypes?.find((st) => st.id === field.value)?.name ?? 'Select service type...'
                                : 'Select service type...'}
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
                                  form.setValue('serviceType', 'all');
                                  setOpenServiceTypeSelect(false);
                                }}
                              >
                                <Check
                                  className={cn('mr-2 h-4 w-4', field.value === 'all' ? 'opacity-100' : 'opacity-0')}
                                />
                                All Service Type
                              </CommandItem>
                              {serviceTypes?.map((serviceType: ServiceType) => (
                                <CommandItem
                                  key={serviceType.id}
                                  value={serviceType.name}
                                  onSelect={() => {
                                    form.setValue('serviceType', serviceType.id);
                                    setOpenServiceTypeSelect(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      field.value === serviceType.id ? 'opacity-100' : 'opacity-0'
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
