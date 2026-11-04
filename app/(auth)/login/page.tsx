import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "./login-form";

export const metadata = { title: "Masuk" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Masuk"
      description="Masuk untuk melihat proyek dan saldo kamu."
      footer={
        <span>
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-brand-ink hover:underline">
            Daftar
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}