"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  error?: string;
  hint?: string;
  adornment?: React.ReactNode;
};

export function Field({ label, error, hint, adornment, className, id, name, ...props }: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? `${name}-${autoId}`;
  const messageId = `${fieldId}-message`;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <div className="relative">
        <Input
          id={fieldId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(adornment && "pr-10", className)}
          {...props}
        />
        {adornment}
      </div>
      {(error || hint) && (
        <p id={messageId} className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type" | "adornment">) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      adornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground outline-none hover:text-brand-ink focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

type SelectFieldProps = React.ComponentProps<"select"> & {
  label: string;
  error?: string;
  placeholder: string;
  options: { value: string; label: string }[];
};

// <select> bawaan browser dengan gaya yang sama seperti Input shadcn,
// supaya aman dipakai di form server action tanpa state tambahan.
export function SelectField({ label, error, placeholder, options, className, id, name, ...props }: SelectFieldProps) {
  const autoId = useId();
  const fieldId = id ?? `${name}-${autoId}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <select
        id={fieldId}
        name={name}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className,
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/40 bg-accent text-accent-foreground",
      )}
    >
      {children}
    </div>
  );
}

export function CheckField({
  label,
  hint,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: string; hint?: string }) {
  return (
    <label className={cn("flex items-start gap-3 text-sm", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded border-input accent-primary outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        {...props}
      />
      <span>
        {label}
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}