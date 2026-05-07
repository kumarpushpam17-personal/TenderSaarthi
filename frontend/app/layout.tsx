import type { Metadata } from "next";
import { TopNav } from "@/components/layout/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderSaarthi",
  description: "Explainable tender eligibility evaluation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <TopNav />
        {children}
      </body>
    </html>
  );
}
