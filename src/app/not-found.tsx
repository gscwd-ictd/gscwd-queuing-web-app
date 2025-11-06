import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function NotFound() {
  const session = await getServerSession(authOptions);

  return (
    <>
      <div>
        <div className="flex h-[100vh] items-center justify-center">
          <div className="flex flex-col items-center gap-5 text-center text-blue-800 dark:text-white">
            <div className="flex flex-col items-center gap-2 md:flex-row lg:flex-row">
              <Image
                src={"/assets/images/mr-tankee-holding-magnifying-glass.png"}
                alt={"Mr. Tankee holding magnifying glass"}
                width={200}
                height={200}
                priority
              />
              <div className="flex flex-col items-center gap-2">
                <p className="text-9xl font-extrabold">404</p>
                <h1 className="text-2xl font-bold">Page Not Found</h1>
              </div>
            </div>
            <p className="text-xl font-semibold">
              It looks like we don&apos;t have service connection here yet.
            </p>
            <Button className="mt-4" asChild size="sm">
              <Link href={session ? "/home" : "/"}>
                <HomeIcon />
                Return to {session ? "Dashboard" : "Home"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
