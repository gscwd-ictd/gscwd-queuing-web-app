"use client";

import { Step1Form } from "./step-1-form";
import { useKioskFormStore } from "@/lib/store/kiosk/useKioskFormStore";

export function KioskStepsForm() {
  const { currentStep } = useKioskFormStore();

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="flex flex-col items-start w-[90%] min-h-[90vh] gap-20
          p-4 h-full"
        >
          {currentStep === 0 && <Step1Form />}
        </div>
      </div>
    </>
  );
}
