import { AppShell, Footer } from "@/features/dashboard/components";

export default function ApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell><main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main><Footer /></AppShell>;
}