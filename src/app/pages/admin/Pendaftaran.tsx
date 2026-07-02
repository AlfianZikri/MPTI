import { useState, useEffect } from "react";
import { Search, Eye, Check, X, Trash2 } from "lucide-react";
import { supabase, type Pendaftaran } from "../../../lib/supabase";

const statusColor: Record<string, { bg: string; text: string }> = {
  Menunggu: { bg: "#FEF3C7", text: "#92400E" },
  Diterima: { bg: "#D1FAE5", text: "#065F46" },
  Ditolak: { bg: "#FEE2E2", text: "#991B1B" },
};

export function AdminPendaftaran() {
  const [list, setList] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [detail, setDetail] = useState<Pendaftaran | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data } = await supabase
      .from("pendaftaran")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setList(data as Pendaftaran[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await supabase.from("pendaftaran").update({ status }).eq("id", id);
    setList((prev) => prev.map((p) => p.id === id ? { ...p, status } : p));
    if (detail?.id === id) setDetail((prev) => prev ? { ...prev, status } : prev);
    setUpdating(null);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data pendaftaran ini?")) return;
    await supabase.from("pendaftaran").delete().eq("id", id);
    setList((prev) => prev.filter((p) => p.id !== id));
    if (detail?.id === id) setDetail(null);
  }

  const filtered = list.filter((p) => {
    const matchSearch = (p.nama_lengkap ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.nomor_pendaftaran ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "Semua" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = { Semua: list.length, Menunggu: list.filter((p) => p.status === "Menunggu").length, Diterima: list.filter((p) => p.status === "Diterima").length, Ditolak: list.filter((p) => p.status === "Ditolak").length };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Pendaftaran Siswa Baru</h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>PPDB Tahun Ajaran 2026/2027</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["Semua", "Menunggu", "Diterima", "Ditolak"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-4 py-2 border transition-colors"
            style={{
              fontSize: "13px", fontWeight: 500,
              backgroundColor: filter === s ? "var(--primary)" : "var(--card)",
              color: filter === s ? "var(--primary-foreground)" : "var(--foreground)",
              borderColor: filter === s ? "var(--primary)" : "var(--border)",
            }}
          >
            {s} <span style={{ fontSize: "11px", opacity: 0.7 }}>({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari nama atau nomor pendaftaran..."
          className="w-full border border-border bg-card text-foreground pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
          style={{ fontSize: "13px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data pendaftaran.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {["No Daftar", "Nama Calon Siswa", "Tgl Daftar", "Orang Tua", "No. HP", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const sc = statusColor[p.status ?? "Menunggu"] ?? statusColor.Menunggu;
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-foreground" style={{ fontSize: "12px", fontFamily: "monospace" }}>{p.nomor_pendaftaran ?? "-"}</td>
                    <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{p.nama_lengkap}</td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                      {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{p.nama_ayah ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{p.no_hp_ortu ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>{p.status ?? "Menunggu"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setDetail(p)} className="text-muted-foreground hover:text-primary transition-colors" title="Lihat detail"><Eye size={13} /></button>
                        {p.status !== "Diterima" && (
                          <button
                            onClick={() => updateStatus(p.id!, "Diterima")}
                            disabled={updating === p.id}
                            className="text-muted-foreground hover:text-green-600 transition-colors"
                            title="Terima"
                          >
                            <Check size={13} />
                          </button>
                        )}
                        {p.status !== "Ditolak" && (
                          <button
                            onClick={() => updateStatus(p.id!, "Ditolak")}
                            disabled={updating === p.id}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Tolak"
                          >
                            <X size={13} />
                          </button>
                        )}
                        <button onClick={() => hapus(p.id!)} className="text-muted-foreground hover:text-destructive transition-colors" title="Hapus">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                  Detail Pendaftaran
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{detail.nomor_pendaftaran}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status bar */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1" style={{ fontSize: "12px", fontWeight: 600, backgroundColor: statusColor[detail.status ?? "Menunggu"]?.bg, color: statusColor[detail.status ?? "Menunggu"]?.text }}>
                  {detail.status ?? "Menunggu"}
                </span>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => updateStatus(detail.id!, "Diterima")}
                    disabled={detail.status === "Diterima" || updating === detail.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-green-600 hover:text-green-600 transition-colors disabled:opacity-40"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    <Check size={12} /> Terima
                  </button>
                  <button
                    onClick={() => updateStatus(detail.id!, "Ditolak")}
                    disabled={detail.status === "Ditolak" || updating === detail.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-destructive hover:text-destructive transition-colors disabled:opacity-40"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    <X size={12} /> Tolak
                  </button>
                </div>
              </div>

              <Section title="Data Calon Siswa">
                <Row label="Nama Lengkap" value={detail.nama_lengkap} />
                <Row label="Nama Panggilan" value={detail.nama_kecil} />
                <Row label="Tempat Lahir" value={detail.tempat_lahir} />
                <Row label="Tanggal Lahir" value={detail.tanggal_lahir ? new Date(detail.tanggal_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
                <Row label="Jenis Kelamin" value={detail.jenis_kelamin} />
                <Row label="Agama" value={detail.agama} />
                <Row label="Alamat" value={detail.alamat} />
                <Row label="Kelurahan" value={detail.kelurahan} />
              </Section>

              <Section title="Data Orang Tua / Wali">
                <Row label="Nama Ayah" value={detail.nama_ayah} />
                <Row label="Pekerjaan Ayah" value={detail.pekerjaan_ayah} />
                <Row label="Nama Ibu" value={detail.nama_ibu} />
                <Row label="Pekerjaan Ibu" value={detail.pekerjaan_ibu} />
                <Row label="No. HP Orang Tua" value={detail.no_hp_ortu} />
                <Row label="Email" value={detail.email_ortu} />
                {detail.nama_wali && <Row label="Nama Wali" value={detail.nama_wali} />}
                {detail.no_hp_wali && <Row label="No. HP Wali" value={detail.no_hp_wali} />}
              </Section>

              <Section title="Kelengkapan Dokumen">
                {[
                  { label: "Akta Kelahiran", val: detail.akte_check },
                  { label: "Kartu Keluarga", val: detail.kk_check },
                  { label: "Pas Foto", val: detail.foto_check },
                  { label: "Ijazah / Surat Keterangan TK", val: detail.ijazah_check },
                  { label: "Raport TK", val: detail.raport_check },
                ].map((d) => (
                  <div key={d.label} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                    <span className={d.val ? "text-green-600" : "text-muted-foreground"}>{d.val ? "✓" : "✗"}</span>
                    <span className="text-foreground" style={{ fontSize: "13px" }}>{d.label}</span>
                  </div>
                ))}
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-foreground mb-3 border-b border-border pb-2" style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 600 }}>{title}</p>
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-4 py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground flex-shrink-0 w-40" style={{ fontSize: "12px" }}>{label}</span>
      <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{value || "-"}</span>
    </div>
  );
}
