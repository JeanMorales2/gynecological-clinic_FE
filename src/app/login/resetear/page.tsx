import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth";

export default function ResetearPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-8">
    <Suspense fallback={null}><ResetPasswordForm /></Suspense>
  </main>;
}
