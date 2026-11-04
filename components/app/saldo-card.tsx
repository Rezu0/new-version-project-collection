import { Card } from "@/components/ui/card";
import { rupiah } from "@/lib/format";

export function SaldoCard({ saldo }: { saldo: number | null }) {
  return (
    <Card className="gap-1 border-primary/30 px-5 py-4">
      <p className="text-sm text-muted-foreground">Saldo sejak penarikan terakhir</p>
      <p className="text-2xl font-semibold text-brand-ink">
        {saldo === null ? "…" : rupiah(saldo)}
      </p>
    </Card>
  );
}