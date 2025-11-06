import { isAfter, isEqual } from "date-fns";
import { z } from "zod";

export const staffReportFormSchema = z
  .object({
    startDate: z.date("Start date is required"),
    endDate: z.date("End date is required"),
    reportType: z.enum(["detailed", "summary"], {
      message: "Please select a report",
    }),
    serviceType: z
      .union([z.uuid(), z.literal("all")])
      .refine((val) => val !== undefined && val !== null, {
        message: "Service type is required",
      }),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return (
          isAfter(data.endDate, data.startDate) ||
          isEqual(data.endDate, data.startDate)
        );
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const supervisorReportFormSchema = z
  .object({
    userId: z.string().optional(),
    startDate: z.date("Start date is required"),
    endDate: z.date("End date is required"),
    reportType: z.enum(["detailed", "summary"], {
      message: "Please select a report",
    }),
    serviceType: z
      .union([z.uuid(), z.literal("all")])
      .refine((val) => val !== undefined && val !== null, {
        message: "Service type is required",
      }),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return (
          isAfter(data.endDate, data.startDate) ||
          isEqual(data.endDate, data.startDate)
        );
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );
