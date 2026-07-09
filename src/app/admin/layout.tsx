export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-theme="light" className="min-h-full bg-background text-foreground">
      {children}
    </div>
  );
}
