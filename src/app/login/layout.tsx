import Image from "next/image";
import logoFull from "@/assets/logo-full.png";

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Image alt="" className="scale-150 object-cover opacity-40 blur-xl" fill priority src={logoFull} />
        <div className="absolute inset-0 bg-bg/70" />
      </div>
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </main>
  );
}
