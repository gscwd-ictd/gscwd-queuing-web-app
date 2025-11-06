import Image from "next/image";
import Link from "next/link";

export function DisplayPageHeader() {
  return (
    <>
      <div className="flex flex-row justify-start items-center gap-4 p-4 w-full">
        <Link href={"/"}>
          <Image
            src={"/assets/images/logo.png"}
            alt={"Logo"}
            width={80}
            height={80}
          />
        </Link>
        <Link href={"/"}>
          <h1 className="font-bold text-primary text-5xl leading-none uppercase">
            General Santos City Water District
          </h1>
        </Link>
      </div>
    </>
  );
}
