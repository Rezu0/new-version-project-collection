import { Card } from "@/components/ui/card";

// Kartu dengan pita judul berwarna primary (E97991), isinya netral.
export function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 overflow-hidden border-primary/30 py-0">
      <div className="flex items-center justify-between gap-4 bg-primary px-5 py-4 text-primary-foreground">
        <div>
          <h2 className="font-semibold leading-tight">{title}</h2>
          {description && <p className="text-sm text-primary-foreground/80">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}