import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { KioskStepsFormHeader } from "./kiosk-steps-form-header";
import { useKioskFormStore } from "@/lib/store/kiosk/useKioskFormStore";

export function WelcomeScreen() {
  const { nextStep } = useKioskFormStore();

  return (
    <>
      <div className="flex-1 flex flex-col items-start justify-between w-full h-full">
        <KioskStepsFormHeader />
        <div className="flex flex-col gap-10 w-full">
          <div className="flex flex-col gap-4">
            <p className="font-bold text-5xl">
              Press &quot;ENTER&quot; to start
            </p>
            <span className="italic text-gray-600 dark:text-white text-4xl">
              Pislita ang enter aron magsugod
            </span>
          </div>
          <Button
            onClick={nextStep}
            className="w-full h-48 justify-start items-center p-4 gap-6"
          >
            <ArrowRight className="h-10 w-10 !size-20" />
            <p className="text-[60px]">ENTER</p>
          </Button>
        </div>
      </div>
    </>
  );
}
