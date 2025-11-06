import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Info, X } from "lucide-react";

export function KioskSubmitError({
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
            <div className="flex flex-row w-full items-start justify-between p-5">
              <DialogTitle className="text-4xl flex flex-row gap-5 items-center ">
                <Info size={60} />
                Submit Error
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size={"icon"} className="">
                  <X className="!h-[100px] !w-[100px]" />
                </Button>
              </DialogClose>
            </div>

            <div className="flex flex-col items-center text-center justify-center gap-10 max-h-full p-10">
              <X size={300} className="text-red-700 p-10" />
              <span className="text-5xl font-semibold leading-none text-red-700">
                There is an error in submission
              </span>
              <span className="text-4xl italic text-gray-500 font-medium">
                Naay problema sa imong pagsumite
              </span>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
