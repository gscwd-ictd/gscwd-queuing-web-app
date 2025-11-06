import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { ServiceTypesComponent } from "./data-table/service-types-component";
import { AddServiceTypeModal } from "./add-service-type-modal";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";
import { ServiceType } from "@/lib/types/prisma/serviceType";

type ViewServiceTypeModalProps = {
  transaction: Transaction & { supervisor: User } & {
    serviceTypes: ServiceType[];
  };
};

export function ViewServiceTypeModal({
  transaction,
}: ViewServiceTypeModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <Eye />
          View Service Types
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Service Types for {transaction.name}</DialogTitle>
          <DialogDescription>
            {transaction.supervisor ? (
              <>Assigned Supervisor: {transaction.supervisor.firstName}</>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full">
          <AddServiceTypeModal transaction={transaction} />
          <ServiceTypesComponent serviceTypes={transaction.serviceTypes} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
