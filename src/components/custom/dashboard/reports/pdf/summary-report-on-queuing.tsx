/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { QueuingTicket, ServiceType, Transaction } from '@prisma/client';
import { PDFReportHeader } from '@/components/custom/features/pdf-report-header';
import { Duration, format, intervalToDuration } from 'date-fns';
import { QueuingTicketReport } from '@/lib/types/prisma/queuingTicket';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';

const styles = StyleSheet.create({
  page: { padding: 20 },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    width: '100%',
  },
  tableHeader: {
    width: '100%',
    fontWeight: 'bold',
    fontSize: 12,
    padding: 3,
  },
  tableFooter: {
    width: '100%',
    fontWeight: 'bold',
    fontSize: 12,
    minHeight: 30,
    padding: 3,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 30,
    borderBottom: '1pt solid #000',
    borderLeft: '1pt solid #000',
    borderRight: '1pt solid #000',
  },
  tableCol: {
    padding: 5,
    borderRight: '1pt solid #000',
  },
  lastCol: {
    padding: 5,
    borderRight: 'none',
  },
  col1: {
    width: '25%',
  },
  col2: {
    width: '25%',
  },
  col3: {
    width: '25%',
  },
  col4: {
    width: '25%',
  },
  tableColumnHeader: {
    width: '100%',
    fontWeight: 'bold',
    borderTop: '1pt solid #000',
  },
  tableCell: {
    margin: 1,
    fontSize: 9,
  },
  footer: {
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    width: '95%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    fontSize: 10,
    minHeight: 20,
    padding: 3,
  },
  generatedBy: {
    alignItems: 'center',
  },
  notedBy: {
    alignItems: 'center',
  },
  approvedBy: {
    alignItems: 'center',
  },
});

type TicketWithTransaction = QueuingTicket & {
  transaction: Pick<Transaction, 'id' | 'name'>;
} & { serviceType: Pick<ServiceType, 'id' | 'name'> };

function durationToSeconds(duration: Duration) {
  return (duration.hours || 0) * 3600 + (duration.minutes || 0) * 60 + (duration.seconds || 0);
}

function formatHMS(totalSeconds: number): string {
  const date = new Date(totalSeconds * 1000);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function transformData(tickets: TicketWithTransaction[]) {
  const result: Record<string, any> = {};

  tickets.forEach((t) => {
    const transactionName = t.transaction.name;
    const lane = t.isPrioritized ? 'Special Lane' : 'Regular Lane';
    const serviceName = t.serviceType.name;

    let durationSeconds = 0;
    if (t.dateTransactionStarted && t.dateTransactionEnded) {
      const duration = intervalToDuration({
        start: new Date(t.dateTransactionStarted),
        end: new Date(t.dateTransactionEnded),
      });
      durationSeconds = durationToSeconds(duration);
    }

    if (!result[transactionName]) {
      result[transactionName] = {
        'Regular Lane': { services: {}, total: 0 },
        'Special Lane': { services: {}, total: 0 },
      };
    }

    if (!result[transactionName][lane].services[serviceName]) {
      result[transactionName][lane].services[serviceName] = {
        count: 0,
        totalSeconds: 0,
      };
    }

    result[transactionName][lane].services[serviceName].count += 1;
    result[transactionName][lane].services[serviceName].totalSeconds += durationSeconds;

    result[transactionName][lane].total += 1;
  });

  return result;
}

const TransactionSection = ({ transactionName, lanes }: any) => (
  <View wrap={false} style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 11, marginBottom: 5 }}>{transactionName}</Text>
    {Object.entries(lanes).map(([laneName, laneData]: any) => (
      <LaneSection key={laneName} laneName={laneName} laneData={laneData} />
    ))}
  </View>
);

const LaneSection = ({ laneName, laneData }: any) => {
  let laneTotalSeconds = 0;
  let laneTotalCount = 0;

  Object.values(laneData.services).forEach((serviceData: any) => {
    laneTotalSeconds += serviceData.totalSeconds;
    laneTotalCount += serviceData.count;
  });

  const laneAverageSeconds = laneTotalCount > 0 ? laneTotalSeconds / laneTotalCount : 0;

  return (
    <View wrap={false} style={{ marginLeft: 10, marginBottom: 10 }}>
      <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>{laneName}</Text>
      <View
        style={{
          flexDirection: 'row',
          borderBottom: '1pt solid #000',
          borderLeft: '1pt solid #000',
          borderRight: '1pt solid #000',
          borderTop: '1pt solid #000',
          paddingVertical: 4,
        }}
      >
        <Text
          style={{
            flex: 2,
            fontSize: 10,
            fontWeight: 'bold',
          }}
        >
          Service Type
        </Text>
        <Text
          style={{
            flex: 1,
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          No. of Tickets
        </Text>
        <Text
          style={{
            flex: 1.5,
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Total Duration (HH:MM:SS)
        </Text>
        <Text
          style={{
            flex: 1.5,
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Average (HH:MM:SS)
        </Text>
      </View>

      {Object.entries(laneData.services).map(([service, serviceData]: any) => (
        <ServiceRow key={service} service={service} serviceData={serviceData} />
      ))}

      {/* Lane Total */}
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 4,
          borderBottom: '1pt solid #000',
          borderLeft: '1pt solid #000',
          borderRight: '1pt solid #000',
        }}
      >
        <Text style={{ flex: 2, fontSize: 10, fontWeight: 'bold' }}>Total</Text>
        <Text
          style={{
            flex: 1,
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {laneData.total}
        </Text>
        <Text
          style={{
            flex: 1.5,
            fontSize: 10,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {formatHMS(laneTotalSeconds)}
        </Text>
        <Text
          style={{
            flex: 1.5,
            fontSize: 10,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          {formatHMS(Math.round(laneAverageSeconds))}
        </Text>
      </View>
    </View>
  );
};

const ServiceRow = ({ service, serviceData }: any) => {
  const { count, totalSeconds } = serviceData;
  const avgSeconds = count > 0 ? totalSeconds / count : 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#000',
        paddingVertical: 3,
      }}
    >
      <Text style={{ flex: 2, fontSize: 10 }}>{service}</Text>
      <Text style={{ flex: 1, fontSize: 10, textAlign: 'center' }}>{count}</Text>
      <Text style={{ flex: 1.5, fontSize: 10, textAlign: 'center' }}>{formatHMS(totalSeconds) ?? 'N/A'}</Text>
      <Text style={{ flex: 1.5, fontSize: 10, textAlign: 'center' }}>{formatHMS(Math.round(avgSeconds)) ?? 'N/A'}</Text>
    </View>
  );
};

// Internal PDF component that receives data as props
const SummaryReportPDF = ({
  reportData,
  startDate,
  endDate,
}: {
  reportData: QueuingTicketReport;
  startDate: Date;
  endDate: Date;
}) => {
  const summary = transformData(reportData.tickets);
  const hasData = Object.keys(summary).length > 0;

  return (
    <Document>
      <Page size={'A4'} style={styles.page}>
        <View style={styles.header}>
          <PDFReportHeader />
          <Text style={styles.title}>Summary Report on Queuing</Text>
          <Text style={styles.title}>
            From {startDate ? format(startDate, 'MM/dd/yy') : ''} - {endDate ? format(endDate, 'MM/dd/yy') : ''}
          </Text>
        </View>

        {hasData ? (
          Object.entries(summary).map(([transactionName, lanes]: any) => (
            <TransactionSection key={transactionName} transactionName={transactionName} lanes={lanes} />
          ))
        ) : (
          <View>
            <View
              style={{
                flexDirection: 'row',
                borderBottom: '1pt solid #000',
                borderLeft: '1pt solid #000',
                borderRight: '1pt solid #000',
                borderTop: '1pt solid #000',
                paddingVertical: 4,
              }}
            >
              <Text style={{ flex: 2, fontSize: 10, fontWeight: 'bold' }}>Service Type</Text>
              <Text
                style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                No. of Tickets
              </Text>
              <Text
                style={{
                  flex: 1.5,
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Total Duration (HH:MM:SS)
              </Text>
              <Text
                style={{
                  flex: 1.5,
                  fontSize: 10,
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                Average (HH:MM:SS)
              </Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                flexDirection: 'row',
                minHeight: 30,
                borderBottom: '1pt solid #000',
                borderLeft: '1pt solid #000',
                borderRight: '1pt solid #000',
              }}
            >
              <Text style={{ color: '#888', fontSize: 12, fontStyle: 'italic' }}>No tickets found</Text>
            </View>
          </View>
        )}

        {/* Generated By / Noted By / Approved By */}
        {reportData.generatedBy && reportData.notedBy && reportData.approvedBy && (
          <View style={styles.footer} wrap={false}>
            <View style={styles.generatedBy}>
              <Text style={{ marginBottom: 30, fontWeight: 'bold' }}>Generated By:</Text>
              <Text>
                {reportData.generatedBy.firstName ?? ''} {reportData.generatedBy.middleName?.charAt(0) ?? ''}.{' '}
                {reportData.generatedBy.lastName ?? ''}
                {reportData.generatedBy.nameExtension ? `, ${reportData.generatedBy.nameExtension}` : ''}
              </Text>
              <Text>{reportData.generatedBy.position ?? ''}</Text>
            </View>
            <View style={styles.notedBy}>
              <Text style={{ marginBottom: 30, fontWeight: 'bold' }}>Noted By:</Text>
              <Text>
                {reportData.notedBy.supervisor.firstName ?? ''}{' '}
                {reportData.notedBy.supervisor.middleName?.charAt(0) ?? ''}.{' '}
                {reportData.notedBy.supervisor.lastName ?? ''}
                {reportData.notedBy.supervisor.nameExtension ? `, ${reportData.notedBy.supervisor.nameExtension}` : ''}
              </Text>
              <Text>{reportData.notedBy.supervisor.position ?? ''}</Text>
            </View>
            <View style={styles.approvedBy}>
              <Text style={{ marginBottom: 30, fontWeight: 'bold' }}>Approved By:</Text>
              <Text>
                {reportData.approvedBy.manager.firstName ?? ''}{' '}
                {reportData.approvedBy.manager.middleName?.charAt(0) ?? ''}.{' '}
                {reportData.approvedBy.manager.lastName ?? ''}
                {reportData.approvedBy.manager.nameExtension ? `, ${reportData.approvedBy.manager.nameExtension}` : ''}
              </Text>
              <Text>{reportData.approvedBy.manager.position ?? ''}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

type SummaryReportOnQueuingProps = {
  startDate: Date;
  endDate: Date;
  userId?: string;
  serviceTypeId?: string;
};

export function SummaryReportOnQueuing({ startDate, endDate, userId, serviceTypeId }: SummaryReportOnQueuingProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const {
    data: reportData,
    isLoading,
    isError,
    error,
  } = useQuery<QueuingTicketReport>({
    queryKey: ['summary-report', startDate.toISOString(), endDate.toISOString(), userId, serviceTypeId],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (userId) params.userId = userId;
      if (serviceTypeId) params.serviceTypeId = serviceTypeId;
      params.startDate = format(startDate, 'yyyy-MM-dd');
      params.endDate = format(endDate, 'yyyy-MM-dd');

      const response = await axios.get<QueuingTicketReport>(
        `${process.env.NEXT_PUBLIC_HOST}/api/queuing-tickets/get-data/reports`,
        { params }
      );
      return response.data;
    },
    enabled: !!startDate && !!endDate,
  });

  const generatePdfPreview = async () => {
    if (!reportData) return;

    setIsGeneratingPdf(true);
    try {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      const blob = await pdf(
        <SummaryReportPDF reportData={reportData} startDate={startDate} endDate={endDate} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF preview:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Generate PDF when data is loaded
  useEffect(() => {
    if (reportData) {
      generatePdfPreview();
    }
  }, [reportData, startDate, endDate]);

  // Clean up URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Log any errors for debugging
  if (error) {
    console.error('Query error:', error);
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading report data</p>
          <p className="text-sm">Please try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {isGeneratingPdf ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-gray-600">Generating PDF preview...</p>
          </div>
        </div>
      ) : pdfUrl ? (
        <iframe src={pdfUrl} className="h-full w-full border-0" title="PDF Preview" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-center text-gray-500">
            <p>No report available</p>
          </div>
        </div>
      )}
    </div>
  );
}
