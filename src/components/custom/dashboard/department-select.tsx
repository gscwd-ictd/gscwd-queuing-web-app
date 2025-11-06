"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Department } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

type DepartmentSelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DepartmentSelect({
  value,
  onValueChange,
  placeholder = "Select department",
  className,
}: DepartmentSelectProps) {
  const { data: departments } = useQuery<Department[]>({
    queryKey: ["get-departments"],
    queryFn: async () => {
      try {
        const response = await axios.get<Department[]>(
          `${process.env.NEXT_PUBLIC_HOST}/api/departments`
        );
        return response.data;
      } catch (error) {
        toast.error("Error fetching departments", {
          description: `${error}`,
        });
        return [];
      }
    },
    refetchOnMount: false,
  });

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {departments &&
          departments.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
