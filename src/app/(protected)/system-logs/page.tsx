import { NoServiceConnection } from "@/components/custom/features/no-service-connection";

export default function SystemLogs() {
  return (
    <>
      <h1 className="text-xl font-semibold">System Logs</h1>
      <div className="mt-6 flex-1 overflow-y-auto flex flex-col items-center justify-center">
        <NoServiceConnection />
      </div>
    </>
  );
}
