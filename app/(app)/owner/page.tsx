import { RoleGuard } from "@/components/app/role-guard";
import { OwnerWorkspace } from "./owner-workspace";

export const metadata = { title: "Dashboard Owner" };

export default function OwnerPage() {
  return (
    <RoleGuard allow="owner">
      <OwnerWorkspace />
    </RoleGuard>
  );
}