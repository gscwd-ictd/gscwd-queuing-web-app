import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Users } from "lucide-react";
import { AddSupervisorToTransactionModal } from "./add-supervisor-to-transaction-modal";
import { RemoveSupervisorFromTransactionModal } from "./remove-supervisor-from-transaction-modal";
import { Transaction } from "@/lib/types/prisma/transaction";
import { User } from "@/lib/types/prisma/user";

type ViewTransactionSupervisorModalProps = {
  transaction: Transaction & { supervisor: User };
};

export function ViewTransactionSupervisorModal({
  transaction,
}: ViewTransactionSupervisorModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Eye />
          View Supervisor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View Transaction Supervisor</DialogTitle>
          <DialogDescription>
            View assigned supervisor for this transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {transaction.supervisor ? (
            <div className="space-y-3">
              <div
                key={transaction.supervisor.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {transaction.supervisor.firstName}{" "}
                    {transaction.supervisor.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.supervisor.email}
                  </p>
                </div>
                <RemoveSupervisorFromTransactionModal
                  transaction={transaction}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AddSupervisorToTransactionModal transaction={transaction} />
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No supervisor assigned to this transaction</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
