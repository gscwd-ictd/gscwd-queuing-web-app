import { User } from "@/lib/types/prisma/user";
import { AddRoutesToUserModal } from "../add-routes-to-user-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { ResetPasswordModal } from "../reset-password-modal";
import { ViewUserDetailsModal } from "../view-user-details-modal";
import { Department } from "@/lib/types/prisma/department";

type UsersActionMenuDialogProps = {
  user: User & { fullName: string } & { department: Department };
};

export function UsersActionMenuDialog({ user }: UsersActionMenuDialogProps) {
  const [openAddRoutesModal, setOpenAddRoutesModal] = useState(false);
  const [openViewUserModal, setOpenViewUserModal] = useState(false);
  const [openResetPasswordModal, setOpenResetPasswordModal] = useState(false);

  return (
    <>
      <ViewUserDetailsModal
        user={user}
        open={openViewUserModal}
        setOpen={setOpenViewUserModal}
      />
      <AddRoutesToUserModal
        user={user}
        open={openAddRoutesModal}
        setOpen={setOpenAddRoutesModal}
      />
      <ResetPasswordModal
        user={user}
        open={openResetPasswordModal}
        setOpen={setOpenResetPasswordModal}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" size="sm">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions for {user.fullName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenViewUserModal(true)}>
            View user details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenAddRoutesModal(true)}>
            Add routes to user
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenResetPasswordModal(true)}>
            Reset password
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
