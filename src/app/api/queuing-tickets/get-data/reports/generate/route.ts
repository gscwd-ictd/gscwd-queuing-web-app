/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import PDFDocument from "pdfkit";
import { format } from "date-fns";
import path from "path";
import { Prisma, QueuingStatus, Role } from "@prisma/client";

type Column = {
  header: string;
  width?: number;
  align?: "left" | "center" | "right";
};

function formatDuration(totalSeconds: number): string {
  const date = new Date(totalSeconds * 1000);
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

const logoPath = path.join(process.cwd(), "public/assets/images/logo.png");

function drawHeader(doc: PDFKit.PDFDocument) {
  const pageWidth = doc.page.width;
  const logoWidth = 50;
  const logoHeight = 50;
  const spacing = 10;

  doc.font("Arial-Bold").fontSize(14);
  const title = "GENERAL SANTOS CITY WATER DISTRICT";
  const titleWidth = doc.widthOfString(title);
  const titleHeight = doc.heightOfString(title);

  doc.font("Arial-Regular").fontSize(10);
  const subtitle = "E. Fernandez St., Lagao, General Santos City";
  const subtitleWidth = doc.widthOfString(subtitle);
  const subtitleHeight = doc.heightOfString(subtitle);

  const textHeight = titleHeight + subtitleHeight;

  const textWidth = Math.max(titleWidth, subtitleWidth);
  const totalWidth = logoWidth + spacing + textWidth;

  const startX = (pageWidth - totalWidth) / 2;
  const logoX = startX;
  const textX = startX + logoWidth + spacing;

  const contentY = 20;
  const logoY = contentY + (textHeight - logoHeight) / 2;

  const titleY = contentY;
  const subtitleY = titleY + titleHeight;

  doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });

  doc.font("Arial-Bold").fontSize(14).text(title, textX, titleY);
  doc.font("Arial-Regular").fontSize(10).text(subtitle, textX, subtitleY);

  return contentY + Math.max(logoHeight, textHeight) + 10;
}

function drawSubHeader(
  doc: PDFKit.PDFDocument,
  y: number,
  reportType: "detailed" | "summary",
  startDate: string,
  endDate: string
) {
  const title =
    reportType === "detailed"
      ? "Detailed Report on Queuing"
      : "Summary Report on Queuing";

  doc.font("Arial-Bold").fontSize(12).text(title, 0, y, { align: "center" });

  y += 16;

  doc
    .font("Arial-Regular")
    .fontSize(9)
    .text(
      `From ${format(startDate, "MM/dd/yy")} - ${format(endDate, "MM/dd/yy")}`,
      0,
      y,
      {
        align: "center",
      }
    );

  return y + 20;
}

function getRowHeight(
  doc: PDFKit.PDFDocument,
  columns: Column[],
  values: string[],
  fontSize = 8.5,
  paddingY = 6
) {
  let maxHeight = 0;
  doc.fontSize(fontSize);

  columns.forEach((col, i) => {
    const textHeight = doc.heightOfString(values[i] ?? "", {
      width: (col.width ?? 0) - 8,
    });
    maxHeight = Math.max(maxHeight, textHeight + paddingY * 2);
  });

  return maxHeight;
}

function drawCell(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  align: "left" | "center" | "right" = "left",
  bold = false
) {
  doc.rect(x, y, width, height).stroke();

  doc
    .font(bold ? "Arial-Bold" : "Arial-Regular")
    .fontSize(8.5)
    .text(text ?? "", x + 4, y + 6, {
      width: width - 8,
      align,
    });
}

function drawRow(
  doc: PDFKit.PDFDocument,
  columns: Column[],
  values: string[],
  x: number,
  y: number,
  bold = false
) {
  const rowHeight = getRowHeight(doc, columns, values);
  let currentX = x;

  columns.forEach((col, i) => {
    drawCell(
      doc,
      values[i] ?? "",
      currentX,
      y,
      col.width ?? 0,
      rowHeight,
      col.align,
      bold
    );
    currentX += col.width ?? 0;
  });

  return y + rowHeight;
}

function drawSignatories(
  doc: PDFKit.PDFDocument,
  y: number,
  generatedBy: any,
  notedBy: any,
  approvedBy: any
) {
  const pageBottom = doc.page.height - doc.page.margins.bottom;
  const blockHeight = 120;

  if (y + blockHeight > pageBottom) {
    doc.addPage();
  }

  const containerWidth = doc.page.width * 0.8;
  const startX = (doc.page.width - containerWidth) / 2;
  const colWidth = containerWidth / 3;
  const startY = doc.page.height - doc.page.margins.bottom - blockHeight;

  const lineHeight = 14;

  function drawColumn(
    x: number,
    label: string,
    name: string,
    position: string
  ) {
    let cy = startY;

    doc.font("Arial-Bold").fontSize(10).text(label, x, cy, {
      width: colWidth,
      align: "center",
    });

    cy += lineHeight * 2;

    doc.font("Arial-Regular").fontSize(10).text(name, x, cy, {
      width: colWidth,
      align: "center",
    });

    cy += lineHeight;

    doc.text(position, x, cy, {
      width: colWidth,
      align: "center",
    });
  }

  drawColumn(
    startX,
    "Generated By:",
    `${generatedBy.firstName} ${generatedBy.middleName?.charAt(0) ?? ""}. ${
      generatedBy.lastName
    }${generatedBy.nameExtension ? `, ${generatedBy.nameExtension}` : ""}`,
    generatedBy.position ?? ""
  );

  drawColumn(
    startX + colWidth,
    "Noted By:",
    `${notedBy.supervisor.firstName} ${
      notedBy.supervisor.middleName?.charAt(0) ?? ""
    }. ${notedBy.supervisor.lastName}${
      notedBy.supervisor.nameExtension
        ? `, ${notedBy.supervisor.nameExtension}`
        : ""
    }`,
    notedBy.supervisor.position ?? ""
  );

  drawColumn(
    startX + colWidth * 2,
    "Approved By:",
    `${approvedBy.manager.firstName} ${
      approvedBy.manager.middleName?.charAt(0) ?? ""
    }. ${approvedBy.manager.lastName}${
      approvedBy.manager.nameExtension
        ? `, ${approvedBy.manager.nameExtension}`
        : ""
    }`,
    approvedBy.manager.position ?? ""
  );
}

function drawTable(
  doc: PDFKit.PDFDocument,
  columns: Column[],
  rows: string[][],
  startX: number,
  startY: number
) {
  let y = startY;

  y = drawRow(
    doc,
    columns,
    columns.map((c) => c.header),
    startX,
    y,
    true
  );

  for (const row of rows) {
    const rowHeight = getRowHeight(doc, columns, row);

    if (y + rowHeight > doc.page.height - 40) {
      doc.addPage();
      y = drawHeader(doc);
      y = drawRow(
        doc,
        columns,
        columns.map((c) => c.header),
        startX,
        y,
        true
      );
    }

    y = drawRow(doc, columns, row, startX, y);
  }

  return y;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { startDate, endDate, reportType, userId, serviceTypeId } =
    await req.json();

  if (!startDate || !endDate || !reportType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const from = new Date(startDate);
  const to = new Date(endDate);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);

  const whereClause: Prisma.QueuingTicketWhereInput = {
    queuingStatus: QueuingStatus.COMPLETED,
    AND: [
      { dateTransactionStarted: { gte: from } },
      { dateTransactionEnded: { lte: to } },
    ],
  };

  switch (session.user.role) {
    case Role.user:
      whereClause.userId = session.user.id;
      break;

    case Role.superuser:
      whereClause.transactionId = session.user.assignedTransactionId;

      if (userId && userId !== "all") {
        whereClause.userId = userId;
      }
      break;

    default:
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (serviceTypeId) {
    whereClause.serviceTypeId = serviceTypeId;
  }

  const tickets = await prisma.queuingTicket.findMany({
    where: whereClause,
    select: {
      id: true,
      dateCreated: true,
      number: true,
      isPrioritized: true,
      dateTransactionStarted: true,
      dateTransactionEnded: true,
      remarks: true,
      otherServiceType: true,
      counter: { select: { code: true, name: true } },
      transaction: { select: { name: true } },
      serviceType: { select: { name: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { dateCreated: "asc" },
  });

  const generatedBy = {
    firstName: session.user.firstName,
    middleName: session.user.middleName,
    lastName: session.user.lastName,
    nameExtension: session.user.nameExtension,
    position: session.user.position,
  };

  const notedBy = await prisma.transaction.findUnique({
    where: {
      id: session.user.assignedTransactionId,
    },
    select: {
      supervisor: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          nameExtension: true,
          position: true,
        },
      },
    },
  });

  const approvedBy = await prisma.department.findUnique({
    where: { id: session.user.departmentId },
    select: {
      manager: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          nameExtension: true,
          position: true,
        },
      },
    },
  });

  const fontRegular = path.join(
    process.cwd(),
    "public/assets/fonts/Arial-Regular.ttf"
  );
  const fontBold = path.join(
    process.cwd(),
    "public/assets/fonts/Arial-Bold.ttf"
  );

  try {
    const doc = new PDFDocument({
      margin: 15,
      size: "A4",
      layout: reportType === "detailed" ? "landscape" : "portrait",
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfDone = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    doc.registerFont("Arial-Regular", fontRegular);
    doc.registerFont("Arial-Bold", fontBold);
    doc.font("Arial-Regular");

    let y = drawHeader(doc);

    y = drawSubHeader(
      doc,
      y,
      reportType,
      format(new Date(startDate), "yyyy-MM-dd"),
      format(new Date(endDate), "yyyy-MM-dd")
    );

    if (reportType === "summary") {
      const grouped: Record<string, any> = {};

      tickets.forEach((t) => {
        const transaction = t.transaction.name;
        const lane = t.isPrioritized ? "Special Lane" : "Regular Lane";
        const service = t.serviceType?.name ?? "";
        const duration =
          t.dateTransactionStarted && t.dateTransactionEnded
            ? Math.floor(
                (new Date(t.dateTransactionEnded).getTime() -
                  new Date(t.dateTransactionStarted).getTime()) /
                  1000
              )
            : 0;

        grouped[transaction] ??= { "Regular Lane": {}, "Special Lane": {} };
        grouped[transaction][lane][service] ??= { count: 0, total: 0 };
        grouped[transaction][lane][service].count += 1;
        grouped[transaction][lane][service].total += duration;
      });

      const margin = 20;
      const usableWidth = doc.page.width - margin * 2;

      // Fraction-based column widths
      const columnFractions: number[] = [
        0.4, // Service Type
        0.2, // No. of Tickets
        0.2, // Total Duration
        0.2, // Average
      ];

      const summaryColumns: Column[] = [
        { header: "Service Type", align: "center" },
        { header: "No. of Tickets", align: "center" },
        { header: "Total Duration", align: "center" },
        { header: "Average", align: "center" },
      ];

      // Assign widths based on fractions
      summaryColumns.forEach((col, i) => {
        col.width = columnFractions[i] * usableWidth;
      });

      for (const [transaction, lanes] of Object.entries(grouped)) {
        doc.font("Arial-Bold").text(transaction, { underline: true });
        y += 10;

        for (const [laneName, services] of Object.entries(lanes as any)) {
          doc.font("Arial-Bold").text(laneName);
          y += 5;

          const rows = Object.entries(services as Record<string, any>).map(
            ([service, data]) => {
              const avg = data.count ? Math.floor(data.total / data.count) : 0;
              return [
                service,
                String(data.count),
                formatDuration(data.total),
                formatDuration(avg),
              ];
            }
          );

          y = drawTable(doc, summaryColumns, rows, margin, y);
          y += 10;

          if (y + 50 > doc.page.height - 40) {
            doc.addPage();
            y = drawHeader(doc);
            y += 10;
          }
        }

        if (y + 50 > doc.page.height - 40) {
          doc.addPage();
          y = drawHeader(doc);
          y += 10;
        }
      }
    }

    if (reportType === "detailed") {
      const lanes = {
        "Regular Lane": tickets.filter((t) => !t.isPrioritized),
        "Special Lane": tickets.filter((t) => t.isPrioritized),
      };

      // Define column fractions
      const columnFractions: number[] = [
        0.07, // Date
        0.07, // Number
        0.12, // Transaction
        0.12, // Counter
        0.07, // Time Started
        0.07, // Time Ended
        0.07, // Duration
        0.12, // Service Type
        0.12, // Other Service Type
        0.17, // Remarks
      ];

      const margin = 20;
      const usableWidth = doc.page.width - margin * 2;

      let isFirstLane = true;

      for (const [laneName, laneTickets] of Object.entries(lanes)) {
        if (!isFirstLane) {
          doc.addPage();
          y = drawHeader(doc) + 10;
        }
        isFirstLane = false;

        doc.font("Arial-Bold").fontSize(10).text(laneName, margin, y);
        y += 14;

        // Define columns with widths based on fractions
        const columns: Column[] = [
          { header: "Date", align: "center" },
          { header: "Number", align: "center" },
          { header: "Transaction", align: "center" },
          { header: "Counter", align: "center" },
          { header: "Time Started", align: "center" },
          { header: "Time Ended", align: "center" },
          { header: "Duration (hh:mm:ss)", align: "center" },
          { header: "Service Type", align: "center" },
          { header: "Other Service Type", align: "center" },
          { header: "Remarks", align: "center" },
        ];

        // Convert fractions to widths
        columns.forEach((col, i) => {
          col.width = columnFractions[i] * usableWidth;
        });

        const rows = laneTickets.map((t) => {
          const duration =
            t.dateTransactionStarted && t.dateTransactionEnded
              ? formatDuration(
                  Math.floor(
                    (new Date(t.dateTransactionEnded).getTime() -
                      new Date(t.dateTransactionStarted).getTime()) /
                      1000
                  )
                )
              : "N/A";

          return [
            format(new Date(t.dateCreated), "MM/dd/yy"),
            t.number,
            t.transaction.name,
            `${t.counter?.code} - ${t.user?.firstName} ${t.user?.lastName}`,
            t.dateTransactionStarted
              ? format(new Date(t.dateTransactionStarted), "HH:mm:ss")
              : "N/A",
            t.dateTransactionEnded
              ? format(new Date(t.dateTransactionEnded), "HH:mm:ss")
              : "N/A",
            duration,
            t.serviceType?.name ?? "n/a",
            t.otherServiceType ?? "n/a",
            t.remarks ?? "n/a",
          ];
        });

        y = drawTable(doc, columns, rows, margin, y);

        y += 10;

        doc
          .font("Arial-Bold")
          .fontSize(9)
          .text(`Total ${laneName} Tickets: ${laneTickets.length}`, margin, y);

        y += 20;
      }
    }

    if (generatedBy && notedBy && approvedBy) {
      drawSignatories(doc, y, generatedBy, notedBy, approvedBy);
    }

    doc.end();
    const pdfBuffer = await pdfDone;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=report.pdf",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
