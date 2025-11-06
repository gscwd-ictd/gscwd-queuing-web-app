import { KioskStepsForm } from "@/components/custom/kiosk/kiosk-steps-form/kiosk-steps-form";
import Image from "next/image";

export default function Kiosk() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full overflow-hidden dark:bg-black/10 relative">
        <div className="absolute inset-0 -z-10">
          <svg
            viewBox="-90 170 200 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full animate-[wiggle_1s_ease-in-out_infinite]"
          >
            <path
              fill="#026093"
              d="M51.2,-39.3C64.2,-24.5,71.2,-3.3,68,17.4C64.8,38.1,51.3,58.4,33.3,65.8C15.2,73.3,-7.5,68,-25.9,57.7C-44.3,47.3,-58.5,31.9,-62.4,14.4C-66.3,-3.2,-59.9,-22.9,-47.8,-37.6C-35.7,-52.2,-17.8,-61.8,0.6,-62.3C19.1,-62.7,38.1,-54.2,51.2,-39.3Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
        <div className="absolute -bottom-80 -right-80 -z-10 object-cover opacity-10">
          <Image
            src={"/assets/images/logo.png"}
            alt={"GSCWD Logo"}
            width={1000}
            height={1000}
            priority
          />
        </div>
        <KioskStepsForm />
      </div>
    </>
  );
}
