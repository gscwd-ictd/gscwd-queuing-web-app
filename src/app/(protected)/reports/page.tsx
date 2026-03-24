'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { useReportsStore } from '@/lib/store/dashboard/useReportsStore';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PDFViewer } from '@react-pdf/renderer';
import { FileX2 } from 'lucide-react';
import { QueuingTicketReport } from '@/lib/types/prisma/queuingTicket';
import { LoadingIndicator } from '@/components/custom/features/loading-indicator';
import { StaffGenerateReportForm } from '@/components/custom/dashboard/reports/staff-generate-reports-form';
import { SupervisorGenerateReportForm } from '@/components/custom/dashboard/reports/supervisor-generate-reports-form';
import { SummaryReportOnQueuing } from '@/components/custom/dashboard/reports/pdf/summary-report-on-queuing';
import { DetailedReportOnQueuing } from '@/components/custom/dashboard/reports/pdf/detailed-report-on-queuing';

export default function Reports() {
  const { data: session } = useSession();
  const {
    filters,
    clearFilters,
    reportData,
    setReportData,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    reportType,
    setReportType,
  } = useReportsStore();

  const {
    data: tickets,
    isFetching,
    isSuccess,
  } = useQuery<QueuingTicketReport, AxiosError>({
    queryKey: ['reports', filters],
    queryFn: async (): Promise<QueuingTicketReport> => {
      const params: Record<string, string> = {};
      if (filters.userId) {
        params.userId = filters.userId;
      }
      if (filters.startDate) {
        params.startDate = format(filters.startDate, 'yyyy-MM-dd');
      }
      if (filters.endDate) {
        params.endDate = format(filters.endDate, 'yyyy-MM-dd');
      }
      if (filters.serviceType) {
        params.serviceTypeId = filters.serviceType;
      }

      const response = await axios.get<QueuingTicketReport>(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-data/reports`,
        { params }
      );
      if (response.data.tickets.length === 0) {
        toast.info('Info', { description: 'No data found' });
        return {
          tickets: [],
          generatedBy: response.data.generatedBy,
          notedBy: response.data.notedBy,
          approvedBy: response.data.approvedBy,
        };
      } else {
        toast.success('Success', {
          description: 'Report generated successfully',
        });
        return response.data;
      }
    },
    enabled: !!filters.startDate && !!filters.endDate && !!filters.reportType,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (isFetching) {
      toast.info('Generating report', {
        description: 'Your report is still generating',
      });
    }
  }, [isFetching]);

  useEffect(() => {
    if (isSuccess && !isFetching && tickets) {
      setReportData(tickets);
      setReportStartDate(filters.startDate);
      setReportEndDate(filters.endDate);
      setReportType(filters.reportType);
      clearFilters();
    }
  }, [
    isSuccess,
    isFetching,
    tickets,
    clearFilters,
    filters,
    setReportData,
    setReportStartDate,
    setReportEndDate,
    setReportType,
  ]);

  useEffect(() => {
    return () => {
      clearFilters();
      setReportData(null);
    };
  }, [clearFilters, setReportData]);

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
      <div className="flex flex-col flex-1 min-h-0 overflow-auto mt-6">
        <div className="h-full flex flex-col mt-2">
          <div className="h-20">{renderForm()}</div>
          <div className="flex-1 p-2" key={reportType}>
            {reportData && reportData.tickets.length > 0 ? (
              <PDFViewer width="100%" height="100%">
                {reportType === 'summary' ? (
                  <SummaryReportOnQueuing reportData={reportData} startDate={reportStartDate} endDate={reportEndDate} />
                ) : (
                  <DetailedReportOnQueuing
                    reportData={reportData}
                    startDate={reportStartDate}
                    endDate={reportEndDate}
                  />
                )}
              </PDFViewer>
            ) : isFetching ? (
              <LoadingIndicator />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex flex-col gap-3 items-center text-gray-400">
                  <FileX2 size={60} />
                  <p className="text-xl font-medium">No report available.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
