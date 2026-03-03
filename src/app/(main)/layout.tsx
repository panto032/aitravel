import { BottomNav } from "@/components/ui/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 relative overflow-x-hidden">
      {/* Background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto min-h-screen relative flex flex-col">
        {children}
      </div>

      <BottomNav />
    </div>
  );
}
