import { RoleGuard } from "@/components/app/role-guard";
import { DoujinWorkspace } from "./doujin-workspace";

export const metadata = { title: "Input Doujin" };

export default function DoujinPage() {
  return (
    <RoleGuard allow="doujin">
      <DoujinWorkspace />
    </RoleGuard>
  );
}