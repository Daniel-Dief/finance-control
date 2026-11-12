import Navbar from '@/components/Navbar';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-background text-foreground">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
