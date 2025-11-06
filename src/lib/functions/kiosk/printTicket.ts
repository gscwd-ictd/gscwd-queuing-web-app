import { GeneratedQueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { format } from "date-fns";

export function printTicket(ticketData: Partial<GeneratedQueuingTicket>) {
  const printWindow = window.open("", "", "width=400,height=400");
  if (!printWindow) return;
  const dateCreated = ticketData.dateCreated;
  const dateNow = new Date().toLocaleString();
  const formattedDate = dateCreated
    ? format(dateCreated, "MM/dd/yyyy hh:mm:ss a")
    : format(dateNow, "MM/dd/yyyy hh:mm:ss a");
  const ticketHtml = `
  <!DOCTYPE html>
  <html>
  <head>
  <title>Queue Ticket</title>
  <style>
  html {
  font-size: 10px;
  }
  @page {
  size: 89mm 51mm portrait;
  margin: 0;
  }
  body {
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 89mm;
  height: 51mm;
  }
  .ticket-container {
  width: 85mm;
  height: 47mm;
  border: 0.2rem solid #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  }
  .header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  gap: 1rem;
  font-size: 0.6rem;
  text-align: center;
  margin: 0;
  }
  .header h1 {
  margin: 0;
  }
  .ticket {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.15rem;
  }
  .ticket-transaction {
  font-size: 1.6rem;
  margin: 0;
  font-weight: 600;
  }
  .ticket-number {
  font-size: 4.5rem;
  font-weight: bold;
  margin: 0;
  }
  @media print {
  @page {
  size: 89mm 51mm landscape;
  margin: 0;
  }
  }
  .additional-text {
  font-size: 1.1rem;
  }
  </style>
  </head>
  <body>
  <script>
  window.onload = () => {
  window.print();
  setTimeout(() => window.close(), 100);
  };
  </script>
  <div class="ticket-container">
  <div class="header">
  <img src="assets/images/logo.png" height="40" width="40" />
  <h1>General Santos City Water District</h1>
  </div>
  <div class="ticket">
  <p class="ticket-transaction">${ticketData.transaction?.name?.toLocaleUpperCase()}</p>
  <p class="ticket-number">${ticketData.number}</p>
  <span class="additional-text">Paalala: kapag limang (5) numero na ang lumipas, marapat po lamang kumuha ng panibagong numero.</span>
  <span class="additional-text">Learn more. Read our CITIZEN's CHARTER. Thank you.</span>
  <span class="additional-text">${formattedDate}</span>
  </div>
  </div>
  </body>
  </html>
  `;

  // ! DEPRECATED - document.write()
  printWindow.document.write(ticketHtml);
  printWindow.document.close();
}
