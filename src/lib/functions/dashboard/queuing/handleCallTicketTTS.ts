import { ttsQueue } from "@/lib/functions/dashboard/queuing/ttsQueue";
import { NowServingTicket } from "@/lib/types/prisma/queuingTicket";

type handleCallTicketTTSProps = {
  ticket: NowServingTicket;
};

export function handleCallTicketTTS({ ticket }: handleCallTicketTTSProps) {
  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    ticket.number
  ) {
    const speechText = `Number ${ticket.number}, Please proceed to ${ticket.counter.name}`;
    ttsQueue.addToQueue(speechText);
  }
}
