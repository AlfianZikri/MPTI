import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Menu, LayoutDashboard, UserCheck, CreditCard } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { supabase, type Siswa } from "../../lib/supabase";

const DEMO_NISN = "0123456789";

const navItems = [
  { label: "Dashboard", href: "/wali", icon: LayoutDashboard },
  { label: "Data Anak", href: "/wali/anak", icon: UserCheck },
  { label: "Pembayaran SPP", href: "/wali/pembayaran", icon: CreditCard },
];

export function WaliLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anak, setAnak] = useState<Siswa | null>(null);

  useEffect(() => {
    supabase.from("siswa").select("*").eq("nisn", DEMO_NISN).single().then(({ data }) => {
      if (data) setAnak(data as Siswa);
    });
  }, []);

  const anakInitials = anak ? anak.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "AR";
  const anakNama = anak ? anak.nama.split(" ").slice(0, 3).join(" ") : "Ahmad Rizki P.";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        title="Orang Tua / Wali"
        subtitle={`Wali Murid · ${anakNama}`}
        avatarInitials="OT"
        avatarColor="#C8972B"
        items={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
          <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-muted-foreground hidden sm:block" style={{ fontSize: "12px" }}>
              {anak ? `Wali: ${anakNama} · Kelas ${anak.kelas}` : "Portal Wali Murid"}
            </span>
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: "#C8972B" }}>
              <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{anakInitials}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
