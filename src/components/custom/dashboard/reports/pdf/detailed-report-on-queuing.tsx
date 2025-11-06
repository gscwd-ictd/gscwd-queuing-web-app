"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PDFReportHeader } from "@/components/custom/features/pdf-report-header";
import { format, intervalToDuration } from "date-fns";
import { QueuingTicketReport } from "@/lib/types/prisma/queuingTicket";

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { padding: 20 },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
    width: "100%",
  },
  tableHeader: {
    width: "100%",
    fontWeight: "bold",
    fontSize: 12,
    padding: 3,
  },
  tableFooter: {
    width: "100%",
    fontWeight: "bold",
    fontSize: 12,
    minHeight: 30,
    padding: 3,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 30,
    borderBottom: "1pt solid #000",
    borderLeft: "1pt solid #000",
    borderRight: "1pt solid #000",
  },
  tableCol: {
    padding: 5,
    borderRight: "1pt solid #000",
  },
  lastCol: {
    padding: 5,
    borderRight: "none",
  },
  col1: {
    width: "6%",
  },
  col2: {
    width: "7%",
  },
  col3: {
    width: "11%",
  },
  col4: {
    width: "11%",
  },
  col5: {
    width: "7%",
  },
  col6: {
    width: "7%",
  },
  col7: {
    width: "9%",
  },
  col8: {
    width: "14%",
  },
  col9: {
    width: "14%",
  },
  col10: {
    width: "14%",
  },
  tableColumnHeader: {
    width: "100%",
    fontWeight: "bold",
    borderTop: "1pt solid #000",
  },
  tableCell: {
    margin: 1,
    fontSize: 9,
  },
  footer: {
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    width: "80%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    fontSize: 11,
    minHeight: 20,
    padding: 3,
  },
  generatedBy: {
    alignItems: "center",
  },
  notedBy: {
    alignItems: "center",
  },
  approvedBy: {
    alignItems: "center",
  },
});

type DetailedReportOnQueuingProps = {
  reportData: QueuingTicketReport;
  startDate: Date;
  endDate: Date;
};

export function DetailedReportOnQueuing({
  reportData,
  startDate,
  endDate,
}: DetailedReportOnQueuingProps) {
  const regularLane = reportData.tickets.filter(
    (ticket) => !ticket.isPrioritized
  );
  const specialLane = reportData.tickets.filter(
    (ticket) => ticket.isPrioritized
  );

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View>
          <View style={styles.header}>
            <PDFReportHeader />
            <Text style={styles.title}>Detailed Report on Queuing</Text>
            <Text style={styles.title}>
              From {startDate ? format(startDate, "MM/dd/yy") : ""} -{" "}
              {endDate ? format(endDate, "MM/dd/yy") : ""}
            </Text>
          </View>
          {/* Regular Lane */}
          <View style={styles.table}>
            {/* Table Header */}
            <View wrap={false}>
              <View style={[styles.tableHeader]}>
                <Text>Regular Lane</Text>
              </View>
              {/* Table Column */}
              <View
                style={[styles.tableRow, styles.tableColumnHeader]}
                wrap={false}
              >
                <View style={[styles.tableCol, styles.col1]}>
                  <Text style={styles.tableCell}>Date</Text>
                </View>
                <View style={[styles.tableCol, styles.col2]}>
                  <Text style={styles.tableCell}>Number</Text>
                </View>
                <View style={[styles.tableCol, styles.col3]}>
                  <Text style={styles.tableCell}>Transaction</Text>
                </View>
                <View style={[styles.tableCol, styles.col4]}>
                  <Text style={styles.tableCell}>Counter</Text>
                </View>
                <View style={[styles.tableCol, styles.col5]}>
                  <Text style={styles.tableCell}>Time Started</Text>
                </View>
                <View style={[styles.tableCol, styles.col6]}>
                  <Text style={styles.tableCell}>Time Ended</Text>
                </View>
                <View style={[styles.tableCol, styles.col7]}>
                  <Text style={styles.tableCell}>Duration (hh:mm:ss)</Text>
                </View>
                <View style={[styles.tableCol, styles.col8]}>
                  <Text style={styles.tableCell}>Service Type</Text>
                </View>
                <View style={[styles.tableCol, styles.col9]}>
                  <Text style={styles.tableCell}>Other Service Type</Text>
                </View>
                <View style={[styles.tableCol, styles.col10, styles.lastCol]}>
                  <Text style={styles.tableCell}>Remarks</Text>
                </View>
              </View>
            </View>
            {regularLane && regularLane.length > 0 ? (
              <>
                {regularLane.map((ticket) => (
                  <View key={ticket.id} style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCol, styles.col1]}>
                      <Text style={styles.tableCell}>
                        {format(ticket.dateCreated, "MM/dd/yy")}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col2]}>
                      <Text style={styles.tableCell}>{ticket.number}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.col3]}>
                      <Text style={styles.tableCell}>
                        {ticket.transaction.name}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col4]}>
                      <Text style={styles.tableCell}>
                        {ticket.counter.code} - {ticket.user.firstName}{" "}
                        {ticket.user.lastName}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col5]}>
                      <Text style={styles.tableCell}>
                        {ticket.dateTransactionStarted
                          ? format(ticket.dateTransactionStarted, "HH:mm:ss")
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col6]}>
                      <Text style={styles.tableCell}>
                        {ticket.dateTransactionEnded
                          ? format(ticket.dateTransactionEnded, "HH:mm:ss")
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col7]}>
                      <Text style={styles.tableCell}>
                        {ticket.dateTransactionStarted &&
                        ticket.dateTransactionEnded
                          ? (() => {
                              const duration = intervalToDuration({
                                start: new Date(ticket.dateTransactionStarted),
                                end: new Date(ticket.dateTransactionEnded),
                              });

                              const hours = String(
                                duration.hours || 0
                              ).padStart(2, "0");
                              const minutes = String(
                                duration.minutes || 0
                              ).padStart(2, "0");
                              const seconds = String(
                                duration.seconds || 0
                              ).padStart(2, "0");

                              return `${hours}:${minutes}:${seconds}`;
                            })()
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col8]}>
                      <Text style={styles.tableCell}>
                        {ticket.serviceType.name}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col9]}>
                      <Text style={styles.tableCell}>
                        {ticket.otherServiceType ?? "n/a"}
                      </Text>
                    </View>
                    <View
                      style={[styles.tableCol, styles.col10, styles.lastCol]}
                    >
                      <Text style={styles.tableCell}>
                        {ticket.remarks ?? "n/a"}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View
                style={[
                  {
                    padding: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  styles.tableRow,
                ]}
              >
                <Text
                  style={{
                    color: "#888",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  No tickets found
                </Text>
              </View>
            )}
            <View style={styles.tableFooter}>
              <Text>Total Regular Lane Tickets: {regularLane.length}</Text>
            </View>
          </View>

          {/* Special Lane */}
          <View style={styles.table}>
            {/* Table Header */}
            <View wrap={false}>
              <View style={[styles.tableHeader]}>
                <Text>Special Lane</Text>
              </View>
              {/* Table Column */}
              <View
                style={[styles.tableRow, styles.tableColumnHeader]}
                wrap={false}
              >
                <View style={[styles.tableCol, styles.col1]}>
                  <Text style={styles.tableCell}>Date</Text>
                </View>
                <View style={[styles.tableCol, styles.col2]}>
                  <Text style={styles.tableCell}>Number</Text>
                </View>
                <View style={[styles.tableCol, styles.col3]}>
                  <Text style={styles.tableCell}>Transaction</Text>
                </View>
                <View style={[styles.tableCol, styles.col4]}>
                  <Text style={styles.tableCell}>Counter</Text>
                </View>
                <View style={[styles.tableCol, styles.col5]}>
                  <Text style={styles.tableCell}>Time Started</Text>
                </View>
                <View style={[styles.tableCol, styles.col6]}>
                  <Text style={styles.tableCell}>Time Ended</Text>
                </View>
                <View style={[styles.tableCol, styles.col7]}>
                  <Text style={styles.tableCell}>Duration (hh:mm:ss)</Text>
                </View>
                <View style={[styles.tableCol, styles.col8]}>
                  <Text style={styles.tableCell}>Service Type</Text>
                </View>
                <View style={[styles.tableCol, styles.col9]}>
                  <Text style={styles.tableCell}>Other Service Type</Text>
                </View>
                <View style={[styles.tableCol, styles.col10, styles.lastCol]}>
                  <Text style={styles.tableCell}>Remarks</Text>
                </View>
              </View>
            </View>
            {specialLane && specialLane.length > 0 ? (
              <>
                {specialLane.map((ticket) => (
                  <View key={ticket.id} style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCol, styles.col1]}>
                      <Text style={styles.tableCell}>
                        {format(ticket.dateCreated, "MM/dd/yy")}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col2]}>
                      <Text style={styles.tableCell}>{ticket.number}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.col3]}>
                      <Text style={styles.tableCell}>
                        {ticket.transaction.name}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col4]}>
                      <Text style={styles.tableCell}>
                        {ticket.counter.code} - {ticket.user.firstName}{" "}
                        {ticket.user.lastName}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col5]}>
                      <Text style={styles.tableCell}>
                        {ticket.dateTransactionStarted
                          ? format(ticket.dateTransactionStarted, "HH:mm:ss")
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col6]}>
                      <Text style={styles.tableCell}>
                        {ticket.dateTransactionEnded
                          ? format(ticket.dateTransactionEnded, "HH:mm:ss")
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col7]}>
                      <Text style={styles.tableCell}>
                        {ticket.dateTransactionStarted &&
                        ticket.dateTransactionEnded
                          ? (() => {
                              const duration = intervalToDuration({
                                start: new Date(ticket.dateTransactionStarted),
                                end: new Date(ticket.dateTransactionEnded),
                              });

                              const hours = String(
                                duration.hours || 0
                              ).padStart(2, "0");
                              const minutes = String(
                                duration.minutes || 0
                              ).padStart(2, "0");
                              const seconds = String(
                                duration.seconds || 0
                              ).padStart(2, "0");

                              return `${hours}:${minutes}:${seconds}`;
                            })()
                          : "N/A"}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col8]}>
                      <Text style={styles.tableCell}>
                        {ticket.serviceType.name}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, styles.col9]}>
                      <Text style={styles.tableCell}>
                        {ticket.otherServiceType ?? "n/a"}
                      </Text>
                    </View>
                    <View
                      style={[styles.tableCol, styles.col10, styles.lastCol]}
                    >
                      <Text style={styles.tableCell}>
                        {ticket.remarks ?? "n/a"}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View
                style={[
                  {
                    padding: 20,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                  styles.tableRow,
                ]}
              >
                <Text
                  style={{
                    color: "#888",
                    fontSize: 12,
                    fontStyle: "italic",
                  }}
                >
                  No tickets found
                </Text>
              </View>
            )}
            <View style={styles.tableFooter}>
              <Text>Total Special Lane Tickets: {specialLane.length}</Text>
            </View>
          </View>

          {/* Generated By / Noted By / Approved By */}
          {reportData.generatedBy &&
            reportData.notedBy &&
            reportData.approvedBy && (
              <View style={styles.footer} wrap={false}>
                <View style={styles.generatedBy}>
                  <Text style={{ marginBottom: 30, fontWeight: "bold" }}>
                    Generated By:
                  </Text>
                  <Text>
                    {reportData.generatedBy.firstName ?? ""}{" "}
                    {reportData.generatedBy.middleName?.charAt(0) ?? ""}.{" "}
                    {reportData.generatedBy.lastName ?? ""}
                    {reportData.generatedBy.nameExtension
                      ? `, ${reportData.generatedBy.nameExtension}`
                      : ""}
                  </Text>
                  <Text>{reportData.generatedBy.position ?? ""}</Text>
                </View>
                <View style={styles.notedBy}>
                  <Text style={{ marginBottom: 30, fontWeight: "bold" }}>
                    Noted By:
                  </Text>
                  <Text>
                    {reportData.notedBy.supervisor.firstName ?? ""}{" "}
                    {reportData.notedBy.supervisor.middleName?.charAt(0) ?? ""}.{" "}
                    {reportData.notedBy.supervisor.lastName ?? ""}
                    {reportData.notedBy.supervisor.nameExtension
                      ? `, ${reportData.notedBy.supervisor.nameExtension}`
                      : ""}
                  </Text>
                  <Text>{reportData.notedBy.supervisor.position ?? ""}</Text>
                </View>
                <View style={styles.approvedBy}>
                  <Text style={{ marginBottom: 30, fontWeight: "bold" }}>
                    Approved By:
                  </Text>
                  <Text>
                    {reportData.approvedBy.manager.firstName ?? ""}{" "}
                    {reportData.approvedBy.manager.middleName?.charAt(0) ?? ""}.{" "}
                    {reportData.approvedBy.manager.lastName ?? ""}
                    {reportData.approvedBy.manager.nameExtension
                      ? `, ${reportData.approvedBy.manager.nameExtension}`
                      : ""}
                  </Text>
                  <Text>{reportData.approvedBy.manager.position ?? ""}</Text>
                </View>
              </View>
            )}
        </View>
      </Page>
    </Document>
  );
}
