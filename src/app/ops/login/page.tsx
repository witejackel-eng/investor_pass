import { OpsLogin } from "../client";

export const metadata = { title: "Control Room — Access", robots: { index: false, follow: false } };

export default function OpsLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm border border-[var(--ops-ink)] bg-[var(--ops-card)] p-8">
        <p className="text-lg font-bold tracking-tight">Investor/Pass <span className="ops-blue">Control Room</span></p>
        <p className="ops-kicker mt-1">PRIVATE · SERVER-VERIFIED ACCESS</p>
        <OpsLogin />
        <p className="ops-kicker mt-6">5 ATTEMPTS / 15 MIN · SESSION 12H · HttpOnly cookie</p>
      </div>
    </div>
  );
}
