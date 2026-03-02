"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { UserSessionWithCounter } from "@/lib/types/prisma/userSession"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { Loader2, Trash2, X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

type RemoveUserSessionModalProps = {
  userWithCounter: UserSessionWithCounter
}

export function RemoveUserSessionModal({
  userWithCounter,
}: RemoveUserSessionModalProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const deleteUserSessionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_HOST}/api/user-session/${userWithCounter.id}/delete-session`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-all-user-session"],
      })
      setOpen(false)
      toast.success("Success", {
        description: "User session removed successfully",
      })
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to remove user session"
      toast.error("Error", {
        description: errorMessage,
      })
    },
  })

  function handleDelete() {
    deleteUserSessionMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <Trash2 />
          Remove User Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Remove {userWithCounter.counter.name} (
            {userWithCounter.counter.code})?
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this session assigned to{" "}
            <strong>
              {userWithCounter.user.firstName} {userWithCounter.user.lastName}
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteUserSessionMutation.isPending}
          >
            <X /> Cancel
          </Button>
          <Button
            size="sm"
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserSessionMutation.isPending}
          >
            {deleteUserSessionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Removing
              </>
            ) : (
              <>
                <Trash2 /> Remove
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
