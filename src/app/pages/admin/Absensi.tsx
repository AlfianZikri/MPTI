import { useState, useEffect } from "react";
import { Search, Plus, Trash2, X, Check } from "lucide-react";
import { supabase, type Siswa } from "../../../lib/supabase";

const kelasOpts = ["VI A", "VI B", "V A", "V B", "IV A", "IV B", "III A", "III B", "II A", "II B", "I A", "I B"];
const statusOpts = ["Hadir", "Sakit", "Izin", "Alpa"] as const;
type StatusAbsensi = typeof statusOpts[number];

const statusColor: Record<StatusAbsensi, { bg: string; text: string }> = {
  Hadir: { bg: "#D1FAE5", text: "#065F46" },
  Sakit: { bg: "#DBEAFE", text: "#1E40AF" },
  Izin: { bg: "#FEF3C7", text: "#92400E" },
  Alpa: { bg: "#FEE2E2", text: "#991B1B" },
};

interface AbsensiRow {
  id: string;
  siswa_id: string;
  tanggal: string;
  status: StatusAbsensi;
  siswa?: { nama: string; kelas: string };
}

const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";

export function AdminAbsensi() {
  const [kelas, setKelas] = useState("VI A");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<AbsensiRow[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Bulk entry state
  const [showBulk, setShowBulk] = useState(false);
  const [bulkEntries, setBulkEntries] = useState<Record<string, StatusAbsensi>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => { fetchData(); }, [kelas, tanggal]);

  async function fetchData() {
    setLoading(true);
    // Fetch siswa in class
    const { data: siswaData } = await supabase
      .from("siswa")
      .select("*")
      .eq("kelas", kelas)
      .eq("status", "Aktif")
      .order("nama");
    if (siswaData) setSiswaList(siswaData as Siswa[]);

    // Fetch attendance for this date + class
    const siswaIds = (siswaData ?? []).map((s: Siswa) => s.id);
    if (siswaIds.length > 0) {
      const { data: absensiData } = await supabase
        .from("absensi")
        .select("*, siswa:siswa_id(nama, kelas)")
        .in("siswa_id", siswaIds)
        .eq("tanggal", tanggal);
      if (absensiData) setRecords(absensiData as AbsensiRow[]);
      else setRecords([]);
    } else {
      setRecords([]);
    }
    setLoading(false);
  }

  function openBulk() {
    // Pre-fill existing records
    const initial: Record<string, StatusAbsensi> = {};
    for (const s of siswaList) {
      const existing = records.find((r) => r.siswa_id === s.id);
      initial[s.id] = existing ? existing.status : "Hadir";
    }
    setBulkEntries(initial);
    setSaveMsg("");
    setShowBulk(true);
  }

  async function saveBulk() {
    setSaving(true);
    setSaveMsg("");
    const upserts = Object.entries(bulkEntries).map(([siswa_id, status]) => ({
      siswa_id, tanggal, status,
    }));

    const { error } = await supabase.from("absensi").upsert(upserts, { onConflict: "siswa_id,tanggal" });
    if (error) {
      setSaveMsg("Gagal menyimpan: " + error.message);
    } else {
      setSaveMsg("Absensi berhasil disimpan!");
      setShowBulk(false);
      fetchData();
    }
    setSaving(false);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data absensi ini?")) return;
    await supabase.from("absensi").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  async function quickUpdate(id: string, newStatus: StatusAbsensi) {
    await supabase.from("absensi").update({ status: newStatus }).eq("id", id);
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
  }

  const filtered = records.filter((r) =>
    r.siswa?.nama?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats for the day
  const hadir = records.filter((r) => r.status === "Hadir").length;
  const tidakHadir = records.filter((r) => r.status !== "Hadir").length;
  const belumDiisi = siswaList.length - records.length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
            Manajemen Absensi
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Catat kehadiran siswa harian</p>
        </div>
        <button
          onClick={openBulk}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <Plus size={15} /> Input Absensi
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="border border-border bg-card text-foreground px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
          style={{ fontSize: "13px" }}
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
        >
          {kelasOpts.map((k) => <option key={k}>{k}</option>)}
        </select>
        <input
          type="date"
          className="border border-border bg-card text-foreground px-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
          style={{ fontSize: "13px" }}
          value={tanggal}
          onChange={(e) => setTanggal(e.target.value)}
        />
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            className="w-full border border-border bg-card text-foreground pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary transition-colors"
            style={{ fontSize: "13px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Day summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Siswa", value: siswaList.length, color: "var(--foreground)" },
          { label: "Hadir", value: hadir, color: "#2D6A4F" },
          { label: "Tidak Hadir", value: tidakHadir, color: "#DC2626" },
          { label: "Belum Diisi", value: belumDiisi, color: "#C8972B" },
        ].map((s) => (
          <div key={s.label} className="bg-secondary border border-border px-4 py-3">
            <p className="text-muted-foreground mb-1" style={{ fontSize: "11px" }}>{s.label}</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {saveMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 border border-border" style={{ backgroundColor: saveMsg.startsWith("Gagal") ? "#FEE2E2" : "#D1FAE5" }}>
          <Check size={14} style={{ color: saveMsg.startsWith("Gagal") ? "#991B1B" : "#065F46" }} />
          <p style={{ fontSize: "13px", color: saveMsg.startsWith("Gagal") ? "#991B1B" : "#065F46" }}>{saveMsg}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
            {records.length === 0
              ? `Belum ada data absensi untuk ${kelas} tanggal ${new Date(tanggal).toLocaleDateString("id-ID")}. Klik "Input Absensi" untuk mengisi.`
              : "Tidak ada siswa yang cocok dengan pencarian."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {["No", "Nama Siswa", "Kelas", "Tanggal", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{i + 1}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{r.siswa?.nama ?? "-"}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "12px" }}>{r.siswa?.kelas ?? kelas}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>
                    {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => quickUpdate(r.id, e.target.value as StatusAbsensi)}
                      className="border border-border bg-card px-2 py-1 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                      style={{ fontSize: "11px", fontWeight: 600, backgroundColor: statusColor[r.status].bg, color: statusColor[r.status].text, borderColor: "transparent" }}
                    >
                      {statusOpts.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => hapus(r.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bulk Input Modal */}
      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                  Input Absensi — {kelas}
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                  {new Date(tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={() => setShowBulk(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {siswaList.length === 0 ? (
                <p className="p-6 text-muted-foreground" style={{ fontSize: "13px" }}>Tidak ada siswa aktif di kelas ini.</p>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0">
                    <tr className="border-b border-border bg-secondary">
                      <th className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>NAMA SISWA</th>
                      <th className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaList.map((s) => (
                      <tr key={s.id} className="border-b border-border hover:bg-secondary/20">
                        <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{s.nama}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1.5 flex-wrap">
                            {statusOpts.map((opt) => {
                              const active = bulkEntries[s.id] === opt;
                              const { bg, text } = statusColor[opt];
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setBulkEntries((p) => ({ ...p, [s.id]: opt }))}
                                  className="px-2.5 py-1 transition-all"
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    backgroundColor: active ? bg : "var(--secondary)",
                                    color: active ? text : "var(--muted-foreground)",
                                    border: `1px solid ${active ? bg : "var(--border)"}`,
                                  }}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-between items-center flex-shrink-0 gap-4">
              {saveMsg && <p style={{ fontSize: "12px", color: saveMsg.startsWith("Gagal") ? "#991B1B" : "#065F46" }}>{saveMsg}</p>}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowBulk(false)} className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors" style={{ fontSize: "13px" }}>Batal</button>
                <button
                  onClick={saveBulk}
                  disabled={saving || siswaList.length === 0}
                  className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  {saving ? "Menyimpan..." : "Simpan Absensi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
