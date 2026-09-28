import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}