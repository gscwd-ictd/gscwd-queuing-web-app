"use client";

import { ModuleCard } from "@/components/custom/features/module-card";
import { PageHeader } from "@/components/custom/features/page-header";
import { TypographyH1 } from "@/components/ui/typography/typography-h1";
import { modules } from "@/lib/constants/modules";
import Image from "next/image";

export default function Modules() {
  return (
    <div className="relative w-screen overflow-hidden flex min-h-screen flex-col items-center justify-between select-none">
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
      <div className="flex flex-col items-center justify-center text-center h-full flex-1">
        <div className="flex flex-col items-center gap-10 h-[80%]">
          <div className="flex flex-col gap-1">
            <TypographyH1>
              <span className="text-primary">Welcome to our Queuing App</span>
            </TypographyH1>
            <p className="text-muted-foreground text-md">
              You can access the modules below
            </p>
          </div>
          <div className="flex flex-row gap-4">
            {modules.map((module, index) => (
              <ModuleCard
                key={index}
                name={module.name}
                link={module.link}
                icon={module.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
