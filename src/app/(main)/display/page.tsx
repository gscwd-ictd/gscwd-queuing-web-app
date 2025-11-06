import { CounterDisplayCard } from "@/components/custom/features/counter-display-card";
import { PageHeader } from "@/components/custom/features/page-header";
import { TypographyH1 } from "@/components/ui/typography/typography-h1";
import { counterDisplays } from "@/lib/constants/display/counterDisplays";
import Image from "next/image";

export default function Display() {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full overflow-hidden dark:bg-black/10 relative select-none">
        <Image
          src="/assets/images/background-image.png"
          alt="GSCWD Background Image"
          fill
          className="object-cover -z-10 opacity-20"
          priority
          quality={100}
          sizes="100vw"
        />
        <PageHeader />
        <div className="flex flex-col items-center gap-10 h-[80%]">
          <div className="flex flex-col gap-1">
            <TypographyH1>
              <span className="text-primary">Counter Display</span>
            </TypographyH1>
            <p className="text-muted-foreground text-md">
              You can access specific counter display below
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center h-full flex-1">
          <div className="grid grid-rows-3 gap-8 w-full p-10">
            {counterDisplays.map((counterDisplay, index) => (
              <CounterDisplayCard
                key={index}
                name={counterDisplay.name}
                link={counterDisplay.link}
                icon={counterDisplay.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
