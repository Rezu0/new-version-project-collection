import { BookOpenText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="gap-0 overflow-hidden border-primary/30 py-0 shadow-lg">
      {/* Header berwarna primary (E97991), badan card tetap netral */}
      <CardHeader className="bg-primary px-6 py-7 text-primary-foreground">
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15">
          <BookOpenText className="size-5" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-primary-foreground/80">{description}</CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-6">{children}</CardContent>

      {footer && (
        <CardFooter className="justify-center border-t bg-muted/40 px-6 py-4 text-sm text-muted-foreground">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}