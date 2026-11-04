export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}