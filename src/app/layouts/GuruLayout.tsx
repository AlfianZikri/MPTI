import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { Menu, LayoutDashboard, BookOpen, Users, ClipboardCheck, BarChart2 } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { supabase, type Guru } from "../../lib/supabase";

const DEMO_GURU_ID = "guru-demo-001";

const navItems = [
  { label: "Dashboard", href: "/guru", icon: LayoutDashboard },
  { label: "Mata Pelajaran", href: "/guru/mapel", icon: BookOpen },
  { label: "Daftar Siswa", href: "/guru/siswa", icon: Users },
  { label: "Input Nilai", href: "/guru/nilai", icon: BarChart2 },
  { label: "Absensi", href: "/guru/absensi", icon: ClipboardCheck },
];

export function GuruLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guru, setGuru] = useState<Guru | null>(null);

  useEffect(() => {
    supabase.from("guru").select("*").eq("id", DEMO_GURU_ID).single().then(({ data }) => {
      if (data) setGuru(data as Guru);
    });
  }, []);

  const initials = guru ? guru.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "GR";
  const title = guru ? guru.nama.split(" ").slice(0, 3).join(" ") : "Guru Pendamping";
  const subtitle = guru ? `${guru.jabatan} · ${guru.mapel}` : "Pengajar";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        title={title}
        subtitle={subtitle}
        avatarInitials={initials}
        avatarColor="#7C3AED"
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
            <span className="text-muted-foreground hidden sm:block" style={{ fontSize: "12px" }}>Tahun Ajaran 2025/2026</span>
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: "#7C3AED" }}>
              <span className="text-white" style={{ fontSize: "11px", fontWeight: 700 }}>{initials}</span>
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
