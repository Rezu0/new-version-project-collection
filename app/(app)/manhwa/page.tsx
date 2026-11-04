import { RoleGuard } from "@/components/app/role-guard";
import { ManhwaWorkspace } from "./manhwa-workspace";

export const metadata = { title: "Input Manhwa" };

export default function ManhwaPage() {
  return (
    <RoleGuard allow="manhwa">
      <ManhwaWorkspace />
    </RoleGuard>
  );
}