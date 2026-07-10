import { useState, useEffect } from "react";
import { BookOpen, Users, BarChart2, ClipboardCheck } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export function GuruDashboard() {
  const [stats, setStats] = useState({ totalMapel: 0, totalSiswa: 0, totalNilai: 0, totalAbsensi: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    if (!supabase) {
      setStats({ totalMapel: 0, totalSiswa: 0, totalNilai: 0, totalAbsensi: 0 });
      setLoading(false);
      return;
    }
    
    const [mapelRes, siswaRes, nilaiRes, absensiRes] = await Promise.all([
      supabase.from("jadwal").select("mapel", { count: "exact" }).eq("guru_nama", "Guru Demo").limit(1),
      supabase.from("siswa").select("*", { count: "exact" }).limit(1),
      supabase.from("nilai").select("*", { count: "exact" }).limit(1),
      supabase.from("absensi").select("*", { count: "exact" }).limit(1),
    ]);

    setStats({
      totalMapel: mapelRes.count || 0,
      totalSiswa: siswaRes.count || 0,
      totalNilai: nilaiRes.count || 0,
      totalAbsensi: absensiRes.count || 0,
    });
    setLoading(false);
  }

  const statCards = [
    { label: "Mata Pelajaran", value: stats.totalMapel, icon: BookOpen, color: "#7C3AED" },
    { label: "Total Siswa", value: stats.totalSiswa, icon: Users, color: "#2D6A4F" },
    { label: "Nilai Tercatat", value: stats.totalNilai, icon: BarChart2, color: "#C8972B" },
    { label: "Absensi", value: stats.totalAbsensi, icon: ClipboardCheck, color: "#DC2626" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Dashboard Guru
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Selamat datang di portal pengelolaan pengajaran Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${card.color}20` }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                {card.label}
              </p>
              <p className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>
                {loading ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-card border border-border p-6">
        <h2 className="text-foreground mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600 }}>
          Informasi Singkat
        </h2>
        <div className="space-y-3" style={{ fontSize: "13px" }}>
          <p className="text-muted-foreground">
            Portal guru memudahkan Anda mengelola mata pelajaran, data siswa, input nilai, dan absensi dalam satu dashboard.
          </p>
          <p className="text-muted-foreground">
            Gunakan menu di samping untuk mengakses fitur-fitur yang tersedia sesuai kebutuhan mengajar Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
