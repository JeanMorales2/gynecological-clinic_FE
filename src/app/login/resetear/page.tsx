import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth";

export default function ResetearPasswordPage() {
  return <Suspense fallback={null}><ResetPasswordForm /></Suspense>;
}
