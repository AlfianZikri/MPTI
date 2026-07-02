import { useState, useEffect } from "react";
import { supabase, type Absensi } from "../../../lib/supabase";

// We use the first student (Ahmad Rizki) as the demo logged-in student
const DEMO_NISN = "0123456789";

const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni"];

const statusColor: Record<string, { bg: string; text: string }> = {
  Hadir: { bg: "#D1FAE5", text: "#065F46" },
  Sakit: { bg: "#DBEAFE", text: "#1E40AF" },
  Izin: { bg: "#FEF3C7", text: "#92400E" },
  Alpa: { bg: "#FEE2E2", text: "#991B1B" },
  Libur: { bg: "#F3F4F6", text: "#6B7280" },
};

interface MonthSummary {
  bulan: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  total: number;
}

export function SiswaAbsensi() {
  const [records, setRecords] = useState<Absensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [siswaId, setSiswaId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: siswa } = await supabase
        .from("siswa")
        .select("id")
        .eq("nisn", DEMO_NISN)
        .single();

      if (!siswa) { setLoading(false); return; }
      setSiswaId(siswa.id);

      const { data } = await supabase
        .from("absensi")
        .select("*")
        .eq("siswa_id", siswa.id)
        .order("tanggal", { ascending: false });

      if (data) setRecords(data as Absensi[]);
      setLoading(false);
    }
    load();
  }, []);

  // Build per-month summary
  const summary: MonthSummary[] = bulanNames.map((bulan, idx) => {
    const monthRecords = records.filter((r) => {
      const m = new Date(r.tanggal).getMonth(); // 0-indexed
      return m === idx;
    });
    return {
      bulan,
      hadir: monthRecords.filter((r) => r.status === "Hadir").length,
      sakit: monthRecords.filter((r) => r.status === "Sakit").length,
      izin: monthRecords.filter((r) => r.status === "Izin").length,
      alpa: monthRecords.filter((r) => r.status === "Alpa").length,
      total: monthRecords.length,
    };
  }).filter((s) => s.total > 0);

  const totalHadir = summary.reduce((a, b) => a + b.hadir, 0);
  const totalHari = summary.reduce((a, b) => a + b.total, 0);
  const pct = totalHari > 0 ? Math.round((totalHadir / totalHari) * 100) : 0;

  const recent = records.slice(0, 7);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Absensi Saya
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Semester Genap 2025/2026 · Kelas VI A</p>
      </div>

      {loading ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground animate-pulse" style={{ fontSize: "13px" }}>
          Memuat data absensi...
        </div>
      ) : (
        <>
          {/* Kehadiran circle */}
          <div className="bg-card border border-border p-6 mb-6 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
              <svg width="120" height="120" className="-rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--secondary)" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#2D6A4F" strokeWidth="10"
                  strokeDasharray={`${(pct / 100) * 314} 314`}
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 700, lineHeight: 1 }}>{pct}%</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Kehadiran</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
              {[
                { label: "Hadir", value: totalHadir, color: "#2D6A4F" },
                { label: "Sakit", value: summary.reduce((a, b) => a + b.sakit, 0), color: "#1B3A6B" },
                { label: "Izin", value: summary.reduce((a, b) => a + b.izin, 0), color: "#C8972B" },
                { label: "Alpa", value: summary.reduce((a, b) => a + b.alpa, 0), color: "#DC2626" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Per bulan */}
            <div className="bg-card border border-border overflow-x-auto">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600 }}>Rekap per Bulan</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    {["Bulan", "Hadir", "Sakit", "Izin", "Alpa"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.map((a) => (
                    <tr key={a.bulan} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{a.bulan}</td>
                      <td className="px-4 py-2.5" style={{ fontSize: "13px", color: "#2D6A4F", fontWeight: 600 }}>{a.hadir}</td>
                      <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "13px" }}>{a.sakit}</td>
                      <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "13px" }}>{a.izin}</td>
                      <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "13px" }}>{a.alpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Riwayat terbaru */}
            <div className="bg-card border border-border p-5">
              <h2 className="text-foreground mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600 }}>Riwayat Terbaru</h2>
              {recent.length === 0 ? (
                <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((h) => {
                    const sc = statusColor[h.status];
                    return (
                      <li key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-foreground" style={{ fontSize: "13px" }}>
                          {new Date(h.tanggal).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        <span className="px-2.5 py-0.5" style={{ fontSize: "11px", fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                          {h.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
