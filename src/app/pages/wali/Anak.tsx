import { useEffect, useState } from "react";
import { supabase, type Siswa, type Nilai, type Guru } from "../../../lib/supabase";

const DEMO_NISN = "0123456789";

const predColor: Record<string, { bg: string; text: string }> = {
  A: { bg: "#D1FAE5", text: "#065F46" },
  B: { bg: "#DBEAFE", text: "#1E40AF" },
  C: { bg: "#FEF3C7", text: "#92400E" },
  D: { bg: "#FEE2E2", text: "#991B1B" },
};

interface AbsensiSummary { bulan: string; hadir: number; sakit: number; izin: number; alpa: number; }

const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function WaliAnak() {
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [absensiSummary, setAbsensiSummary] = useState<AbsensiSummary[]>([]);
  const [waliKelas, setWaliKelas] = useState<string>("-");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: siswaData } = await supabase.from("siswa").select("*").eq("nisn", DEMO_NISN).single();
      if (!siswaData) { setLoading(false); return; }
      setSiswa(siswaData as Siswa);

      // Nilai
      const { data: nilaiData } = await supabase.from("nilai").select("*").eq("siswa_id", siswaData.id).order("mapel");
      if (nilaiData) setNilaiList(nilaiData as Nilai[]);

      // Absensi - group by month
      const { data: absensiData } = await supabase.from("absensi").select("tanggal, status").eq("siswa_id", siswaData.id);
      if (absensiData) {
        const grouped: Record<number, AbsensiSummary> = {};
        for (const row of absensiData) {
          const month = new Date(row.tanggal).getMonth();
          if (!grouped[month]) grouped[month] = { bulan: bulanNames[month], hadir: 0, sakit: 0, izin: 0, alpa: 0 };
          if (row.status === "Hadir") grouped[month].hadir++;
          else if (row.status === "Sakit") grouped[month].sakit++;
          else if (row.status === "Izin") grouped[month].izin++;
          else if (row.status === "Alpa") grouped[month].alpa++;
        }
        setAbsensiSummary(Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map((k) => grouped[Number(k)]));
      }

      // Wali kelas
      const { data: guruData } = await supabase.from("guru").select("nama").eq("mapel", siswaData.kelas).single() as { data: Guru | null };
      if (guruData) setWaliKelas(guruData.nama);

      setLoading(false);
    }
    load();
  }, []);

  const naValues = nilaiList.map((n) => n.nilai_akhir ?? 0).filter((v) => v > 0);
  const rataRata = naValues.length ? Math.round(naValues.reduce((a, b) => a + b, 0) / naValues.length) : 0;
  const totalHadir = absensiSummary.reduce((a, b) => a + b.hadir, 0);
  const totalHari = absensiSummary.reduce((a, b) => a + b.hadir + b.sakit + b.izin + b.alpa, 0);
  const pctKehadiran = totalHari > 0 ? Math.round((totalHadir / totalHari) * 100) : 0;

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Data Anak</h1>
        </div>
        <div className="bg-card border border-border p-8 animate-pulse text-center text-muted-foreground" style={{ fontSize: "13px" }}>Memuat data...</div>
      </div>
    );
  }

  if (!siswa) return <p className="text-muted-foreground p-8">Data siswa tidak ditemukan.</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Data Anak</h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Semester Genap 2025/2026</p>
      </div>

      {/* Biodata */}
      <div className="bg-card border border-border p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <InfoRow label="Nama Lengkap" value={siswa.nama} />
        <InfoRow label="NISN" value={siswa.nisn} />
        <InfoRow label="Kelas" value={siswa.kelas} />
        <InfoRow label="Tempat, Tgl Lahir" value={
          [siswa.tempat_lahir, siswa.tgl_lahir ? new Date(siswa.tgl_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null].filter(Boolean).join(", ") || "-"
        } />
        <InfoRow label="Jenis Kelamin" value={siswa.jk === "L" ? "Laki-laki" : "Perempuan"} />
        <InfoRow label="Agama" value={siswa.agama ?? "-"} />
        <InfoRow label="Wali Kelas" value={waliKelas} />
        <InfoRow label="Rata-rata Nilai" value={rataRata ? String(rataRata) : "-"} />
        <InfoRow label="Status" value={siswa.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nilai */}
        <div>
          <h2 className="text-foreground mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>
            Nilai Akademik — Rata-rata: <span className="text-primary">{rataRata || "-"}</span>
          </h2>
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Mata Pelajaran", "Tugas", "UH", "UTS", "UAS", "NA", "Pred."].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nilaiList.length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data nilai.</td></tr>
                ) : nilaiList.map((n) => {
                  const pred = n.predikat ?? "C";
                  const { bg, text } = predColor[pred] ?? predColor.C;
                  return (
                    <tr key={n.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-3 py-2.5 text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{n.mapel}</td>
                      {[n.tugas, n.uh, n.uts, n.uas, n.nilai_akhir].map((v, i) => (
                        <td key={i} className="px-3 py-2.5 text-foreground" style={{ fontSize: "12px", fontWeight: i === 4 ? 700 : 400 }}>{v ?? "-"}</td>
                      ))}
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5" style={{ fontSize: "10px", fontWeight: 700, backgroundColor: bg, color: text }}>{pred}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Absensi */}
        <div>
          <h2 className="text-foreground mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>
            Absensi — Kehadiran: <span className="text-primary">{pctKehadiran}%</span>
          </h2>
          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Bulan", "Hadir", "Sakit", "Izin", "Alpa"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {absensiSummary.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data absensi.</td></tr>
                ) : absensiSummary.map((a) => (
                  <tr key={a.bulan} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{a.bulan}</td>
                    <td className="px-4 py-2.5" style={{ fontSize: "13px", fontWeight: 600, color: "#2D6A4F" }}>{a.hadir}</td>
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "13px" }}>{a.sakit}</td>
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "13px" }}>{a.izin}</td>
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "13px" }}>{a.alpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground mb-0.5" style={{ fontSize: "11px", fontWeight: 500 }}>{label.toUpperCase()}</p>
      <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
