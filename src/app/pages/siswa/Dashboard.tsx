import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, Star, Bell } from "lucide-react";
import { Link } from "react-router";
import { supabase, type Nilai, type Berita } from "../../../lib/supabase";

const DEMO_NISN = "0123456789";
const DEMO_NAMA = "Ahmad Rizki";

export function SiswaDashboard() {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [pengumuman, setPengumuman] = useState<Berita[]>([]);
  const [kehadiran, setKehadiran] = useState<string>("…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Get siswa id
      const { data: siswa } = await supabase.from("siswa").select("id").eq("nisn", DEMO_NISN).single();
      if (siswa) {
        // Nilai
        const { data: nilaiData } = await supabase.from("nilai").select("*").eq("siswa_id", siswa.id).order("mapel");
        if (nilaiData) setNilaiList(nilaiData as Nilai[]);
        // Absensi - calculate attendance %
        const { data: absensiData } = await supabase.from("absensi").select("status").eq("siswa_id", siswa.id);
        if (absensiData && absensiData.length > 0) {
          const hadir = absensiData.filter((a) => a.status === "Hadir").length;
          setKehadiran(`${Math.round((hadir / absensiData.length) * 100)}%`);
        }
      }
      // Pengumuman
      const { data: beritaData } = await supabase.from("berita").select("*").eq("status", "Publikasi").order("tanggal", { ascending: false }).limit(3);
      if (beritaData) setPengumuman(beritaData as Berita[]);
      setLoading(false);
    }
    load();
  }, []);

  const naValues = nilaiList.map((n) => n.nilai_akhir ?? 0).filter((v) => v > 0);
  const rataRata = naValues.length ? Math.round(naValues.reduce((a, b) => a + b, 0) / naValues.length) : 0;
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Halo, {DEMO_NAMA} 👋
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{today} · Semester Genap 2025/2026</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Rata-rata Nilai", value: loading ? "…" : rataRata || "-", icon: Star, color: "#C8972B", href: "/siswa/nilai" },
          { label: "Kehadiran", value: loading ? "…" : kehadiran, icon: ClipboardCheck, color: "#2D6A4F", href: "/siswa/absensi" },
          { label: "Mata Pelajaran", value: loading ? "…" : nilaiList.length, icon: BookOpen, color: "#1B3A6B", href: "/siswa/nilai" },
          { label: "Pengumuman", value: loading ? "…" : pengumuman.length, icon: Bell, color: "#7C3AED", href: "#" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.href} className="bg-card border border-border p-5 hover:border-primary/40 transition-colors block">
              <div className="w-8 h-8 flex items-center justify-center mb-3" style={{ backgroundColor: s.color + "20" }}>
                <Icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nilai ringkasan */}
        <div className="lg:col-span-2 bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Nilai Semester Ini</h2>
            <Link to="/siswa/nilai" className="text-primary" style={{ fontSize: "12px" }}>Lihat semua →</Link>
          </div>
          {loading ? (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Memuat...</p>
          ) : nilaiList.length === 0 ? (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data nilai.</p>
          ) : (
            <div className="space-y-3">
              {nilaiList.slice(0, 6).map((n) => {
                const val = n.nilai_akhir ?? 0;
                const color = val >= 90 ? "#2D6A4F" : val >= 75 ? "#1B3A6B" : "#C8972B";
                return (
                  <div key={n.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{n.mapel}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color }}>{val}</span>
                    </div>
                    <div className="h-1.5 bg-secondary">
                      <div className="h-full transition-all" style={{ width: `${val}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pengumuman */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-foreground mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Pengumuman</h2>
          {pengumuman.length === 0 ? (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada pengumuman.</p>
          ) : (
            <ul className="space-y-4">
              {pengumuman.map((p) => (
                <li key={p.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <span className="text-muted-foreground flex-shrink-0" style={{ fontSize: "11px", fontWeight: 500, marginTop: "2px" }}>
                    {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                  <p className="text-foreground" style={{ fontSize: "13px", lineHeight: 1.6 }}>{p.judul}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
