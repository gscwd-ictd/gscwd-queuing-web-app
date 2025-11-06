"use client";

import { Suspense } from "react";
import { ServiceTypesDataTable } from "./service-types-data-table";
import { serviceTypesColumns } from "./service-types-columns";
import { ServiceType } from "@/lib/types/prisma/serviceType";

type ServiceTypesComponentProps = {
  serviceTypes: ServiceType[];
}

export function ServiceTypesComponent({ serviceTypes }: ServiceTypesComponentProps) {
  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <div className="p-2">
          <ServiceTypesDataTable
            columns={serviceTypesColumns}
            data={serviceTypes ?? []}
          />
        </div>
      </Suspense>
    </>
  );
}
