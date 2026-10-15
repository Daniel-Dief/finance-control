import Navbar from "@/components/Navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto max-w-7xl flex-grow px-6 py-8">
        {children}
      </main>
    </div>
  );
}
