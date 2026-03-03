"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { useReportsStore } from "@/lib/store/dashboard/useReportsStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { FileX2 } from "lucide-react";

import { StaffGenerateReportForm } from "@/components/custom/dashboard/reports/staff-generate-reports-form";
import { SupervisorGenerateReportForm } from "@/components/custom/dashboard/reports/supervisor-generate-reports-form";

export default function Reports() {
  const { data: session } = useSession();
  const { filters } = useReportsStore();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["generate-report", filters],
    enabled: !!filters.startDate && !!filters.endDate && !!filters.reportType,
    queryFn: async () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-data/reports/generate`,
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
          reportType: filters.reportType,
          userId: filters.userId,
          serviceTypeId: filters.serviceType,
        },
        { responseType: "blob" }
      );
      
      return res.data;
    },
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      const url = URL.createObjectURL(data);
      setPdfUrl(url);
      toast.success("Report generated successfully");
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to generate report");
    }
  }, [isError]);

  const renderForm = () => {
    switch (session?.user?.role) {
      case Role.user:
        return <StaffGenerateReportForm />;
      case Role.superuser:
        return <SupervisorGenerateReportForm />;
      default:
        return null;
    }
  };

  return (
    <>
      <h1 className="text-xl font-semibold">Reports</h1>

      <div className="flex flex-col flex-1 min-h-0 mt-4 gap-4">
        <div className="shrink-0">{renderForm()}</div>
        <div className="flex flex-1 items-center justify-center">
          {isFetching ? (
            <div className="flex items-center gap-2">
              <Spinner className="size-6" />
              <span>Generating report…</span>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Generated Report"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <FileX2 size={60} />
              <p>No report generated</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
