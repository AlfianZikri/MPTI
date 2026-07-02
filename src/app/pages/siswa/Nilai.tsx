import { useState, useEffect } from "react";
import { supabase, type Nilai } from "../../../lib/supabase";

const DEMO_NISN = "0123456789";

const predColor: Record<string, { bg: string; text: string }> = {
  A: { bg: "#D1FAE5", text: "#065F46" },
  B: { bg: "#DBEAFE", text: "#1E40AF" },
  C: { bg: "#FEF3C7", text: "#92400E" },
  D: { bg: "#FEE2E2", text: "#991B1B" },
};

export function SiswaNilai() {
  const [nilaiList, setNilaiList] = useState<Nilai[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: siswa } = await supabase
        .from("siswa")
        .select("id")
        .eq("nisn", DEMO_NISN)
        .single();

      if (!siswa) { setLoading(false); return; }

      const { data } = await supabase
        .from("nilai")
        .select("*")
        .eq("siswa_id", siswa.id)
        .order("mapel", { ascending: true });

      if (data) setNilaiList(data as Nilai[]);
      setLoading(false);
    }
    load();
  }, []);

  const naValues = nilaiList.map((n) => n.nilai_akhir ?? 0).filter((v) => v > 0);
  const rataRata = naValues.length ? Math.round(naValues.reduce((a, b) => a + b, 0) / naValues.length) : 0;
  const tertinggi = naValues.length ? Math.max(...naValues) : 0;
  const terendah = naValues.length ? Math.min(...naValues) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Nilai Saya
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Semester Genap 2025/2026 · Kelas VI A</p>
      </div>

      {loading ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
          Memuat data nilai...
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Rata-rata", value: rataRata || "-" },
              { label: "Tertinggi", value: tertinggi || "-" },
              { label: "Terendah", value: terendah || "-" },
              { label: "Predikat Umum", value: rataRata >= 90 ? "A" : rataRata >= 80 ? "B" : rataRata >= 70 ? "C" : rataRata > 0 ? "D" : "-" },
            ].map((s) => (
              <div key={s.label} className="bg-secondary border border-border px-4 py-3">
                <p className="text-muted-foreground mb-1" style={{ fontSize: "11px" }}>{s.label}</p>
                <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Mata Pelajaran", "Tugas", "UH", "UTS", "UAS", "Nilai Akhir", "Predikat"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nilaiList.map((n) => {
                  const pred = n.predikat ?? "C";
                  const { bg, text } = predColor[pred] ?? predColor.C;
                  return (
                    <tr key={n.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{n.mapel}</td>
                      {[n.tugas, n.uh, n.uts, n.uas].map((v, i) => (
                        <td key={i} className="px-4 py-3 text-foreground" style={{ fontSize: "13px" }}>{v ?? "-"}</td>
                      ))}
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{n.nilai_akhir ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5" style={{ fontSize: "12px", fontWeight: 700, backgroundColor: bg, color: text }}>{pred}</span>
                      </td>
                    </tr>
                  );
                })}
                {nilaiList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                      Belum ada data nilai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-4" style={{ fontSize: "12px" }}>
            KKM (Kriteria Ketuntasan Minimal): 70 · Nilai Akhir = 20% Tugas + 20% UH + 30% UTS + 30% UAS
          </p>
        </>
      )}
    </div>
  );
}
