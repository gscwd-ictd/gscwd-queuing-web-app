import { PersonnelComponent } from "@/components/custom/dashboard/personnel/data-table/personnel-component";

export default function Personnel() {
  return (
    <>
      <h1 className="text-xl font-semibold">Personnel</h1>
      <div className="mt-6">
        <PersonnelComponent />
      </div>
    </>
  );
}
