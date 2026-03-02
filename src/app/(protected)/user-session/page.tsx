import { UserSessionComponent } from "@/components/custom/dashboard/user-session/data-table/user-session-component";

export default function UserSession() {
  return (
    <>
      <h1 className="text-xl font-semibold">User Session</h1>
      <div className="mt-6">
        <UserSessionComponent />
      </div>
    </>
  );
}
