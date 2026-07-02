import { useEffect, useState } from "react";
import { Star, ClipboardCheck, CreditCard, Bell } from "lucide-react";
import { Link } from "react-router";
import { supabase, type Nilai, type SPP, type Berita, type Siswa } from "../../../lib/supabase";

const DEMO_NISN = "0123456789";

export function WaliDashboard() {
  const [anak, setAnak] = useState<Siswa | null>(null);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [sppStatus, setSppStatus] = useState<string>("…");
  const [kehadiran, setKehadiran] = useState<string>("…");
  const [pengumuman, setPengumuman] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: siswa } = await supabase.from("siswa").select("*").eq("nisn", DEMO_NISN).single();
      if (siswa) {
        setAnak(siswa as Siswa);
        // Nilai
        const { data: nilaiData } = await supabase.from("nilai").select("*").eq("siswa_id", siswa.id).order("nilai_akhir", { ascending: false }).limit(4);
        if (nilaiData) setNilaiList(nilaiData as Nilai[]);
        // SPP status
        const { data: sppData } = await supabase.from("spp").select("status").eq("siswa_id", siswa.id).eq("status", "Belum Bayar");
        setSppStatus(sppData && sppData.length > 0 ? "Ada Tunggakan" : "Lunas");
        // Absensi
        const { data: absensiData } = await supabase.from("absensi").select("status").eq("siswa_id", siswa.id);
        if (absensiData && absensiData.length > 0) {
          const hadir = absensiData.filter((a: { status: string }) => a.status === "Hadir").length;
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
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Selamat Datang</h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{today} · Portal Wali Murid SDN 1 Suro</p>
      </div>

      {/* Profil anak */}
      <div className="bg-primary p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-14 h-14 bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-accent-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px" }}>
            {anak ? anak.nama.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() : "…"}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-primary-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>
            {loading ? "Memuat…" : anak?.nama ?? "-"}
          </p>
          <p style={{ fontSize: "13px", color: "#9CAEC7" }}>
            Kelas {anak?.kelas ?? "-"} · NISN {anak?.nisn ?? "-"} · TA 2025/2026
          </p>
        </div>
        <Link to="/wali/anak" className="bg-card text-foreground px-4 py-2 hover:bg-secondary transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
          Lihat Detail
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Rata-rata Nilai", value: loading ? "…" : rataRata || "-", icon: Star, color: "#C8972B", href: "/wali/anak" },
          { label: "Kehadiran", value: loading ? "…" : kehadiran, icon: ClipboardCheck, color: "#2D6A4F", href: "/wali/anak" },
          { label: "Status SPP", value: loading ? "…" : sppStatus, icon: CreditCard, color: sppStatus === "Lunas" ? "#1B3A6B" : "#DC2626", href: "/wali/pembayaran" },
          { label: "Pengumuman", value: loading ? "…" : pengumuman.length, icon: Bell, color: "#7C3AED", href: "#" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.href} className="bg-card border border-border p-5 hover:border-primary/40 transition-colors block">
              <div className="w-8 h-8 flex items-center justify-center mb-3" style={{ backgroundColor: s.color + "20" }}>
                <Icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Nilai & Pengumuman */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6">
          <h2 className="text-foreground mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Nilai Terbaru Anak</h2>
          {loading ? (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Memuat...</p>
          ) : nilaiList.length === 0 ? (
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data nilai.</p>
          ) : (
            <div className="space-y-3">
              {nilaiList.map((n) => (
                <div key={n.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-foreground" style={{ fontSize: "13px" }}>{n.mapel}</span>
                    <span className="text-primary" style={{ fontSize: "13px", fontWeight: 700 }}>{n.nilai_akhir ?? "-"}</span>
                  </div>
                  <div className="h-1.5 bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${n.nilai_akhir ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/wali/anak" className="block mt-4 text-primary" style={{ fontSize: "12px" }}>Lihat semua nilai →</Link>
        </div>

        <div className="bg-card border border-border p-6">
          <h2 className="text-foreground mb-5" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>Pengumuman Sekolah</h2>
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
