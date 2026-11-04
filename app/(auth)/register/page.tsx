import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Buat akun"
      description="Daftar sebagai staff dengan kode dari admin."
      footer={
        <span>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-brand-ink hover:underline">
            Masuk
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}