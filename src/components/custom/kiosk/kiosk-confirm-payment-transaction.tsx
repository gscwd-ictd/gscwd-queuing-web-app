import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Info } from "lucide-react";

type KioskConfirmPaymentTransactionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function KioskConfirmPaymentTransaction({
  open,
  onOpenChange,
}: KioskConfirmPaymentTransactionProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-full min-w-[75%] rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-5xl p-5 flex flex-row gap-5 items-center text-primary">
            <Info size={60} /> Payment Reminder
          </AlertDialogTitle>
          <AlertDialogDescription className="text-black flex flex-col gap-30 items-center justify-center mb-10 h-200 text-center p-20">
            <span className="text-5xl font-semibold">
              Make sure you have your bill/receipt with you when making a
              payment. If none, select{" "}
              <span className="font-bold">&quot;Customer Welfare&quot;</span> to
              get your latest bill.
            </span>
            <span className="text-4xl font-medium text-gray-700">
              Siguroha nga naa kay dala nga bill/resibo kung magbayad ka. Kung
              wala, pilia ang{" "}
              <span className="font-bold">&quot;Customer Welfare&quot;</span>{" "}
              aron makuha ang imong pinakabag-o nga bill.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="text-4xl p-10">
            I understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
