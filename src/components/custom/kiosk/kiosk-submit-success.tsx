import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { transactionOptions } from "@/lib/constants/kiosk/transactionOptions";
import { GeneratedQueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { CircleCheck, Info } from "lucide-react";

export function KioskSubmitSuccess({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Partial<GeneratedQueuingTicket>;
}) {
  const transactionName = transactionOptions.find(
    (option) => option.id === data.transaction?.id
  )?.name;

  const tableValues = [
    {
      header: "Number",
      value: data.number,
    },
    {
      header: "Transaction",
      value: transactionName,
    },
    {
      header: "Senior Citizen, Pregnant, or PWD",
      value: data.isPrioritized ? "Yes" : "No",
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[75%] rounded-xl"
        >
          <DialogHeader>
            <DialogTitle className="text-4xl flex flex-row gap-5 items-center p-5">
              <Info size={60} />
              Submit Success
            </DialogTitle>
            <div className="flex flex-col items-center justify-center gap-4 max-h-full p-10">
              <CircleCheck size={300} className="text-green-700" />
              <span className="text-5xl font-semibold leading-none text-green-700 text-center">
                Here&apos;s what you have submitted
              </span>
              <span className="text-4xl italic text-gray-500 font-medium">
                Kini ang imong gisumite
              </span>
              <div className="h-full w-full mt-50 flex flex-col gap-4">
                <Table className="text-4xl">
                  <TableBody>
                    {tableValues.map((tableValue, index) => (
                      <TableRow key={index}>
                        <TableCell className="break-words whitespace-normal max-w-[600px] text-gray-700">
                          {tableValue.header}
                        </TableCell>
                        <TableCell className="font-semibold break-words whitespace-normal max-w-[600px]">
                          {tableValue.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex flex-col p-4 w-full bg-white border-2 border-black items-center mt-3">
                  <p className="text-3xl text-black font-bold tracking-wide">
                    {data.isPrioritized ? "SPECIAL LANE" : "REGULAR LANE"}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="text-4xl h-20 w-36">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
