import { LoginForm } from "@/components/custom/features/login-form";
import { PageHeader } from "@/components/custom/features/page-header";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(`${process.env.NEXT_PUBLIC_HOST}/home`);
  }

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 ">
          <PageHeader />
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block ">
          <Image
            src="/assets/images/background-image.png"
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2]"
            fill
          />
        </div>
      </div>
    </>
  );
}
