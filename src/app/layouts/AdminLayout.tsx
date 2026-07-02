import { useState } from "react";
import { Outlet } from "react-router";
import { Menu, LayoutDashboard, Users, GraduationCap, BarChart2, Newspaper, ClipboardCheck, FileText } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Data Siswa", href: "/admin/siswa", icon: Users },
  { label: "Data Guru", href: "/admin/guru", icon: GraduationCap },
  { label: "Nilai & Raport", href: "/admin/nilai", icon: BarChart2 },
  { label: "Absensi", href: "/admin/absensi", icon: ClipboardCheck },
  { label: "Berita & Pengumuman", href: "/admin/berita", icon: Newspaper },
  { label: "Pendaftaran PPDB", href: "/admin/pendaftaran", icon: FileText },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        title="Admin Sekolah"
        subtitle="Pengelola Akademik"
        avatarInitials="AD"
        avatarColor="#C8972B"
        items={navItems}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-muted-foreground hidden sm:block" style={{ fontSize: "12px" }}>
              Tahun Ajaran 2025/2026
            </span>
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground" style={{ fontSize: "11px", fontWeight: 700 }}>AD</span>
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
