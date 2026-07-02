import { useState, useEffect } from "react";
import { CheckCircle, Clock, AlertCircle, Send } from "lucide-react";
import { supabase, type SPP } from "../../../lib/supabase";

const DEMO_NISN = "0123456789";

type StatusSPP = "Lunas" | "Belum Bayar" | "Menunggu Konfirmasi";

const statusConfig: Record<StatusSPP, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  Lunas: { icon: CheckCircle, bg: "#D1FAE5", text: "#065F46", label: "Lunas" },
  "Belum Bayar": { icon: AlertCircle, bg: "#FEE2E2", text: "#991B1B", label: "Belum Bayar" },
  "Menunggu Konfirmasi": { icon: Clock, bg: "#FEF3C7", text: "#92400E", label: "Menunggu" },
};

function fmt(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function WaliPembayaran() {
  const [spp, setSpp] = useState<SPP[]>([]);
  const [loading, setLoading] = useState(true);
  const [siswaId, setSiswaId] = useState<string | null>(null);
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [konfirmasiId, setKonfirmasiId] = useState<string | null>(null);
  const [konfirmasiMetode, setKonfirmasiMetode] = useState("Transfer Bank Jateng");
  const [savingKonfirmasi, setSavingKonfirmasi] = useState(false);
  const [konfirmasiMsg, setKonfirmasiMsg] = useState("");

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
        .from("spp")
        .select("*")
        .eq("siswa_id", siswa.id)
        .order("created_at", { ascending: true });

      if (data) setSpp(data as SPP[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleKonfirmasi() {
    if (!konfirmasiId) return;
    setSavingKonfirmasi(true);
    const { error } = await supabase
      .from("spp")
      .update({ status: "Menunggu Konfirmasi", metode: konfirmasiMetode })
      .eq("id", konfirmasiId);
    if (!error) {
      setSpp((prev) => prev.map((s) => s.id === konfirmasiId ? { ...s, status: "Menunggu Konfirmasi", metode: konfirmasiMetode } : s));
      setKonfirmasiMsg("Konfirmasi berhasil dikirim. Tunggu verifikasi dari pihak sekolah.");
      setKonfirmasi(false);
    } else {
      setKonfirmasiMsg("Gagal mengirim: " + error.message);
    }
    setSavingKonfirmasi(false);
  }

  const totalLunas = spp.filter((s) => s.status === "Lunas").reduce((a, s) => a + s.jumlah, 0);
  const totalTagihan = spp.filter((s) => s.status !== "Lunas").reduce((a, s) => a + s.jumlah, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Pembayaran SPP
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Ahmad Rizki Pratama · Kelas VI A · TA 2025/2026</p>
      </div>

      {loading ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
          Memuat data pembayaran...
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border p-5">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "12px" }}>Total Terbayar</p>
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "#2D6A4F" }}>{fmt(totalLunas)}</p>
            </div>
            <div className="bg-card border border-border p-5">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "12px" }}>Total Tagihan</p>
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: totalTagihan > 0 ? "#DC2626" : "var(--foreground)" }}>
                {fmt(totalTagihan)}
              </p>
            </div>
            <div className="bg-card border border-border p-5">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "12px" }}>SPP per Bulan</p>
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>{fmt(150000)}</p>
            </div>
          </div>

          {/* Konfirmasi pesan */}
          {konfirmasiMsg && (
            <div className="mb-4 px-4 py-3 border border-border" style={{ backgroundColor: konfirmasiMsg.startsWith("Gagal") ? "#FEE2E2" : "#D1FAE5", fontSize: "13px", color: konfirmasiMsg.startsWith("Gagal") ? "#991B1B" : "#065F46" }}>
              {konfirmasiMsg}
            </div>
          )}

          {/* Tagihan aktif */}
          {totalTagihan > 0 && (
            <div className="bg-card border-2 p-5 mb-6" style={{ borderColor: "#DC2626" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}>
                    Tagihan Belum Dibayar
                  </p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
                    {spp.filter((s) => s.status !== "Lunas").map((s) => s.bulan).join(", ")} — Total {fmt(totalTagihan)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Pembayaran via:</p>
                  <div className="bg-secondary border border-border px-4 py-2">
                    <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Bank Jateng</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>No. Rek: 1-002-12345-6 a.n. SDN 1 Suro</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Riwayat */}
          <div className="bg-card border border-border overflow-x-auto">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600 }}>Riwayat Pembayaran</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  {["Bulan", "Jumlah", "Tanggal Bayar", "Metode", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spp.map((s) => {
                  const sc = statusConfig[s.status as StatusSPP] ?? statusConfig["Belum Bayar"];
                  const Icon = sc.icon;
                  return (
                    <tr key={s.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{s.bulan}</td>
                      <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px" }}>{fmt(s.jumlah)}</td>
                      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "13px" }}>
                        {s.tgl_bayar
                          ? new Date(s.tgl_bayar).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "13px" }}>{s.metode ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 w-fit" style={{ fontSize: "11px", fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                          <Icon size={11} />
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-muted-foreground mt-4" style={{ fontSize: "12px" }}>
            Konfirmasi pembayaran dapat dilakukan dengan menghubungi TU sekolah di (0298) 712345 atau langsung ke kantor.
          </p>
        </>
      )}
    </div>
  );
}
