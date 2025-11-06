import { AddUserModal } from "@/components/custom/dashboard/users/add-user-modal";
import { UsersComponent } from "@/components/custom/dashboard/users/data-table/users-component";

export default function Users() {
  return (
    <>
      <h1 className="text-xl font-semibold">Users</h1>
      <div className="mt-6">
        <AddUserModal />
        <UsersComponent />
      </div>
    </>
  );
}
