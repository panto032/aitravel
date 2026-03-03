import Link from "next/link";
import { Target } from "lucide-react";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Target size={28} className="text-indigo-500" />
            <span className="text-2xl font-black tracking-tighter italic">
              Travel<span className="text-indigo-500 underline decoration-4 underline-offset-4">AI</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Kreiraj nalog i otkrij najbolje smeštaje
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-slate-600 mt-8 font-medium">
          Već imaš nalog?{" "}
          <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  );
}
