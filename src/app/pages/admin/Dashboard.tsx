import { useEffect, useState } from "react";
import { Users, GraduationCap, TrendingUp, ClipboardList, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase, type Siswa, type Berita } from "../../../lib/supabase";

const kelasGroups = [
  { label: "Kelas I", keys: ["I A", "I B"] },
  { label: "Kelas II", keys: ["II A", "II B"] },
  { label: "Kelas III", keys: ["III A", "III B"] },
  { label: "Kelas IV", keys: ["IV A", "IV B"] },
  { label: "Kelas V", keys: ["V A", "V B"] },
  { label: "Kelas VI", keys: ["VI A", "VI B"] },
];

export function AdminDashboard() {
  const [totalSiswa, setTotalSiswa] = useState<number | null>(null);
  const [totalGuru, setTotalGuru] = useState<number | null>(null);
  const [rataRata, setRataRata] = useState<number | null>(null);
  const [nilaiPerKelas, setNilaiPerKelas] = useState<{ kelas: string; rata: number }[]>([]);
  const [recentSiswa, setRecentSiswa] = useState<Siswa[]>([]);
  const [pengumuman, setPengumuman] = useState<Berita[]>([]);

  useEffect(() => {
    // Total siswa
    supabase.from("siswa").select("id", { count: "exact", head: true }).then(({ count }) => setTotalSiswa(count ?? 0));
    // Total guru
    supabase.from("guru").select("id", { count: "exact", head: true }).then(({ count }) => setTotalGuru(count ?? 0));
    // Recent siswa
    supabase.from("siswa").select("*").order("created_at", { ascending: false }).limit(5).then(({ data }) => { if (data) setRecentSiswa(data as Siswa[]); });
    // Pengumuman terbaru
    supabase.from("berita").select("*").eq("status", "Publikasi").order("tanggal", { ascending: false }).limit(3).then(({ data }) => { if (data) setPengumuman(data as Berita[]); });
    // Rata-rata nilai per kelas
    supabase.from("nilai").select("kelas, nilai_akhir").then(({ data }) => {
      if (!data) return;
      const grouped: Record<string, number[]> = {};
      for (const row of data) {
        if (!row.nilai_akhir) continue;
        if (!grouped[row.kelas]) grouped[row.kelas] = [];
        grouped[row.kelas].push(row.nilai_akhir);
      }
      const chartData = kelasGroups.map((g) => {
        const vals = g.keys.flatMap((k) => grouped[k] ?? []);
        const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
        return { kelas: g.label, rata: avg };
      }).filter((d) => d.rata > 0);
      setNilaiPerKelas(chartData);
      // Overall avg
      const allVals = Object.values(grouped).flat();
      setRataRata(allVals.length ? Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10 : null);
    });
  }, []);

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const stats = [
    { label: "Total Siswa", value: totalSiswa !== null ? String(totalSiswa) : "…", icon: Users, delta: "Siswa aktif" },
    { label: "Total Guru & Staf", value: totalGuru !== null ? String(totalGuru) : "…", icon: GraduationCap, delta: "Tenaga pendidik" },
    { label: "Rata-rata Nilai", value: rataRata !== null ? String(rataRata) : "…", icon: TrendingUp, delta: "Semester Genap 2025/2026" },
    { label: "Pengumuman Aktif", value: String(pengumuman.length), icon: ClipboardList, delta: "Dipublikasikan" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Dashboard Admin</h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Selamat datang — {today}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 bg-secondary flex items-center justify-center">
                  <Icon size={16} className="text-primary" />
                </div>
              </div>
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{s.label}</p>
              <p className="text-accent mt-2" style={{ fontSize: "11px", fontWeight: 500 }}>{s.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Rata-rata Nilai per Kelas</h2>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Semester Genap 2025/2026</span>
          </div>
          {nilaiPerKelas.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={nilaiPerKelas} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="kelas" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: "1px solid var(--border)", borderRadius: 0, fontSize: "12px", backgroundColor: "var(--card)" }} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="rata" fill="#1B3A6B" name="Rata-rata Nilai" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground" style={{ fontSize: "13px" }}>
              Belum ada data nilai.
            </div>
          )}
        </div>

        {/* Recent students */}
        <div className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Siswa Terbaru</h2>
            <Link to="/admin/siswa" className="text-primary flex items-center gap-1" style={{ fontSize: "11px" }}>Semua <ArrowRight size={10} /></Link>
          </div>
          {recentSiswa.length === 0 ? (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Memuat...</p>
          ) : (
            <ul className="space-y-3">
              {recentSiswa.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-7 h-7 bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary" style={{ fontSize: "11px", fontWeight: 700 }}>{s.nama.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{s.nama}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.kelas}</p>
                  </div>
                  <span className="px-2 py-0.5" style={{ backgroundColor: s.status === "Aktif" ? "#D1FAE5" : "#FEE2E2", color: s.status === "Aktif" ? "#065F46" : "#991B1B", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap" }}>{s.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pengumuman terbaru */}
      {pengumuman.length > 0 && (
        <div className="mt-6 bg-card border border-border p-6">
          <h2 className="text-foreground mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Berita & Pengumuman Terbaru</h2>
          <ul className="space-y-3">
            {pengumuman.map((p) => (
              <li key={p.id} className="flex items-start gap-4 pb-3 border-b border-border last:border-0">
                <span className="px-2 py-0.5 text-white flex-shrink-0 mt-0.5" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: { Prestasi: "#1B3A6B", Kegiatan: "#2D6A4F", Pengumuman: "#C8972B", Akademik: "#7C3AED" }[p.kategori] ?? "#6B7280" }}>{p.kategori}</span>
                <div>
                  <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{p.judul}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
