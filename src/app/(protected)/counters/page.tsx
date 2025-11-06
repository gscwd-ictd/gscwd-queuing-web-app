import { AddCounterModal } from "@/components/custom/dashboard/counters/add-counter-modal";
import { CountersComponent } from "@/components/custom/dashboard/counters/data-table/counters-component";

export default function Counters() {
  return (
    <>
      <h1 className="text-xl font-semibold">Counters</h1>
      <div className="mt-6">
        <AddCounterModal />
        <CountersComponent />
      </div>
    </>
  );
}
