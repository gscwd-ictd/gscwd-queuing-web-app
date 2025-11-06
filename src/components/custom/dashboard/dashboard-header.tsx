import Image from "next/image";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <>
      <div className="flex flex-row justify-end items-center gap-4 p-1 w-full">
        <Link href={"/"}>
          <Image
            src={"/assets/images/logo.png"}
            alt={"GSCWD Logo"}
            width={40}
            height={40}
          />
        </Link>
        <Link href={"/"}>
          <h1 className="font-semibold text-primary leading-none">
            General Santos City Water District
          </h1>
        </Link>
      </div>
    </>
  );
}
