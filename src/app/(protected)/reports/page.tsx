'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';
import { useReportsStore } from '@/lib/store/dashboard/useReportsStore';
import { FileX2 } from 'lucide-react';
import { LoadingIndicator } from '@/components/custom/features/loading-indicator';
import { StaffGenerateReportForm } from '@/components/custom/dashboard/reports/staff-generate-reports-form';
import { SupervisorGenerateReportForm } from '@/components/custom/dashboard/reports/supervisor-generate-reports-form';
import { SummaryReportOnQueuing } from '@/components/custom/dashboard/reports/pdf/summary-report-on-queuing';
import { DetailedReportOnQueuing } from '@/components/custom/dashboard/reports/pdf/detailed-report-on-queuing';

export default function Reports() {
  const { data: session } = useSession();
  const { reportParams, clearReportParams } = useReportsStore();

  const renderForm = () => {
    // Handle loading state
    if (!session) {
      return (
        <div className="flex items-center justify-center h-20">
          <LoadingIndicator />
        </div>
      );
    }

    // Handle missing user role
    if (!session.user?.role) {
      return (
        <div className="flex items-center justify-center h-20 text-red-500">
          <p>Unable to determine user permissions</p>
        </div>
      );
    }

    // Render appropriate form based on role
    switch (session.user.role) {
      case Role.user:
        return <StaffGenerateReportForm />;
      case Role.superuser:
        return <SupervisorGenerateReportForm />;
      case Role.admin:
        return <SupervisorGenerateReportForm />;
      default:
        return (
          <div className="flex items-center justify-center h-20 text-yellow-500">
            <p>Unsupported user role: {session.user.role}</p>
          </div>
        );
    }
  };

  const handleClearReport = () => {
    clearReportParams();
  };

  const hasActiveReport = reportParams && reportParams.startDate && reportParams.endDate && reportParams.reportType;

  return (
    <>
      <h1 className="text-xl font-semibold">Reports</h1>
      <div className="flex flex-col flex-1 min-h-0 overflow-auto mt-6">
        <div className="h-full flex flex-col mt-2">
          <div className="h-20">{renderForm()}</div>
          <div className="flex-1 p-2">
            {hasActiveReport ? (
              <div className="h-full flex flex-col">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleClearReport}
                    className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border"
                  >
                    Clear Report
                  </button>
                </div>
                <div className="flex-1 min-h-[500px]">
                  {reportParams.reportType === 'summary' && (
                    <SummaryReportOnQueuing
                      startDate={reportParams.startDate}
                      endDate={reportParams.endDate}
                      userId={reportParams.userId}
                      serviceTypeId={reportParams.serviceTypeId}
                    />
                  )}

                  {reportParams.reportType === 'detailed' && (
                    <DetailedReportOnQueuing
                      startDate={reportParams.startDate}
                      endDate={reportParams.endDate}
                      userId={reportParams.userId}
                      serviceTypeId={reportParams.serviceTypeId}
                    />
                  )}

                  {/* <TestPdf startDate={reportParams.startDate} endDate={reportParams.endDate} /> */}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="flex flex-col gap-3 items-center text-gray-400">
                  <FileX2 size={60} />
                  <p className="text-xl font-medium">No report available.</p>
                  <p className="text-sm">Select filters and click Generate Report to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
