import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Info, LoaderCircle } from "lucide-react";

export function KioskSubmitPending({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="h-[75%] min-w-[75%] rounded-xl"
        >
          <DialogHeader>
            <DialogTitle className="text-4xl p-5 flex flex-row gap-5 items-center ">
              <Info size={60} />
              Submit Pending
            </DialogTitle>
            <div className="flex flex-col items-center text-center justify-center gap-16 max-h-full p-10">
              <LoaderCircle
                size={300}
                className="text-gray-700 p-10 animate-spin"
              />
              <span className="text-5xl font-semibold leading-none text-gray-700">
                Your submitted details is being processed
              </span>
              <span className="text-4xl italic text-gray-500 font-medium">
                Giproseso ang imong gisumiter nga mga detalye
              </span>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
