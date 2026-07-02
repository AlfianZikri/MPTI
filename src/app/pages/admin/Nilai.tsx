import { useState, useEffect } from "react";
import { Download, Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase, type Nilai, type Siswa } from "../../../lib/supabase";

const kelasOpts = ["VI A", "VI B", "V A", "V B", "IV A", "IV B", "III A", "III B", "II A", "II B", "I A", "I B"];
const mapelOpts = ["Matematika", "Bahasa Indonesia", "IPA", "IPS", "PKn", "SBdP", "PJOK", "PAI", "Bahasa Inggris"];

function getColor(n: number) {
  if (n >= 90) return { bg: "#D1FAE5", text: "#065F46" };
  if (n >= 75) return { bg: "#DBEAFE", text: "#1E40AF" };
  if (n >= 60) return { bg: "#FEF3C7", text: "#92400E" };
  return { bg: "#FEE2E2", text: "#991B1B" };
}
function calcPredikat(n: number) { return n >= 90 ? "A" : n >= 80 ? "B" : n >= 70 ? "C" : "D"; }

interface NilaiWithSiswa extends Nilai { siswa: Siswa; }

const emptyForm = { siswa_id: "", tugas: "", uh: "", uts: "", uas: "", nilai_akhir: "" };
const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";

export function AdminNilai() {
  const [kelas, setKelas] = useState("VI A");
  const [mapel, setMapel] = useState("Matematika");
  const [data, setData] = useState<NilaiWithSiswa[]>([]);
  const [siswaDiKelas, setSiswaDiKelas] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<NilaiWithSiswa | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchNilai(); }, [kelas, mapel]);
  useEffect(() => { fetchSiswaDiKelas(); }, [kelas]);

  async function fetchNilai() {
    setLoading(true);
    const { data: rows } = await supabase.from("nilai").select("*, siswa(*)").eq("kelas", kelas).eq("mapel", mapel);
    if (rows) setData(rows as NilaiWithSiswa[]);
    setLoading(false);
  }

  async function fetchSiswaDiKelas() {
    const { data } = await supabase.from("siswa").select("*").eq("kelas", kelas).eq("status", "Aktif").order("nama");
    if (data) setSiswaDiKelas(data as Siswa[]);
  }

  function openAdd() {
    setEditTarget(null);
    setForm({ ...emptyForm, siswa_id: siswaDiKelas[0]?.id ?? "" });
    setFormError(""); setShowModal(true);
  }

  function openEdit(row: NilaiWithSiswa) {
    setEditTarget(row);
    setForm({ siswa_id: row.siswa_id, tugas: String(row.tugas ?? ""), uh: String(row.uh ?? ""), uts: String(row.uts ?? ""), uas: String(row.uas ?? ""), nilai_akhir: String(row.nilai_akhir ?? "") });
    setFormError(""); setShowModal(true);
  }

  function calcNA() {
    const t = parseFloat(form.tugas) || 0;
    const u = parseFloat(form.uh) || 0;
    const s = parseFloat(form.uts) || 0;
    const a = parseFloat(form.uas) || 0;
    if (!t && !u && !s && !a) return "";
    return String(Math.round(t * 0.2 + u * 0.2 + s * 0.3 + a * 0.3));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.siswa_id) { setFormError("Pilih siswa terlebih dahulu."); return; }
    setSaving(true); setFormError("");

    const na = parseInt(form.nilai_akhir || calcNA()) || 0;
    const payload = {
      siswa_id: form.siswa_id,
      kelas, mapel,
      tugas: parseInt(form.tugas) || null,
      uh: parseInt(form.uh) || null,
      uts: parseInt(form.uts) || null,
      uas: parseInt(form.uas) || null,
      nilai_akhir: na || null,
      predikat: na ? calcPredikat(na) : null,
      semester: "Genap",
      tahun_ajaran: "2025/2026",
    };

    if (editTarget) {
      const { error } = await supabase.from("nilai").update(payload).eq("id", editTarget.id);
      if (error) { setFormError(error.message); setSaving(false); return; }
    } else {
      // Check duplicate
      const { data: existing } = await supabase.from("nilai").select("id").eq("siswa_id", form.siswa_id).eq("kelas", kelas).eq("mapel", mapel).single();
      if (existing) { setFormError("Siswa ini sudah memiliki nilai untuk mapel tersebut. Gunakan edit."); setSaving(false); return; }
      const { error } = await supabase.from("nilai").insert([payload]);
      if (error) { setFormError(error.message); setSaving(false); return; }
    }
    setSaving(false); setShowModal(false);
    fetchNilai();
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data nilai ini?")) return;
    await supabase.from("nilai").delete().eq("id", id);
    setData((prev) => prev.filter((d) => d.id !== id));
  }

  const values = data.map((d) => d.nilai_akhir ?? 0).filter((v) => v > 0);
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const lulus = values.filter((v) => v >= 70).length;
  function up(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Nilai & Raport</h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Semester Genap 2025/2026</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus size={14} /> Tambah Nilai
          </button>
          <button className="flex items-center gap-2 border border-border text-foreground px-4 py-2.5 hover:border-primary hover:text-primary transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download size={14} /> Ekspor
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select className="border border-border bg-card text-foreground px-4 py-2.5 focus:outline-none focus:border-primary transition-colors" style={{ fontSize: "13px" }} value={kelas} onChange={(e) => setKelas(e.target.value)}>
          {kelasOpts.map((k) => <option key={k}>{k}</option>)}
        </select>
        <select className="border border-border bg-card text-foreground px-4 py-2.5 focus:outline-none focus:border-primary transition-colors" style={{ fontSize: "13px" }} value={mapel} onChange={(e) => setMapel(e.target.value)}>
          {mapelOpts.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border overflow-x-auto mb-8">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Memuat data...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {["No", "Nama Siswa", "Tugas", "UH", "UTS", "UAS", "Nilai Akhir", "Predikat", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const na = row.nilai_akhir ?? 0;
                const { bg, text } = getColor(na);
                return (
                  <tr key={row.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{i + 1}</td>
                    <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{row.siswa?.nama ?? "-"}</td>
                    {[row.tugas, row.uh, row.uts, row.uas].map((v, j) => (
                      <td key={j} className="px-4 py-3 text-foreground" style={{ fontSize: "13px" }}>{v ?? "-"}</td>
                    ))}
                    <td className="px-4 py-3"><span style={{ fontSize: "13px", fontWeight: 700, color: text }}>{na || "-"}</span></td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5" style={{ fontSize: "11px", fontWeight: 700, backgroundColor: bg, color: text }}>{row.predikat ?? "-"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(row)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => hapus(row.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Hapus"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada data nilai untuk {kelas} — {mapel}.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Rata-rata Kelas", value: avg || "-" },
          { label: "Nilai Tertinggi", value: values.length ? Math.max(...values) : "-" },
          { label: "Nilai Terendah", value: values.length ? Math.min(...values) : "-" },
          { label: "Lulus KKM (≥70)", value: values.length ? `${lulus}/${values.length}` : "-" },
        ].map((item) => (
          <div key={item.label} className="bg-secondary border border-border px-4 py-3">
            <p className="text-muted-foreground mb-1" style={{ fontSize: "11px" }}>{item.label}</p>
            <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                {editTarget ? "Edit Nilai" : `Tambah Nilai — ${kelas} / ${mapel}`}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <NField label="Siswa">
                <select className={`${inp} cursor-pointer`} value={form.siswa_id} onChange={(e) => up("siswa_id", e.target.value)} disabled={!!editTarget}>
                  {siswaDiKelas.map((s) => <option key={s.id} value={s.id}>{s.nama}</option>)}
                </select>
              </NField>
              <div className="grid grid-cols-2 gap-3">
                {(["tugas", "uh", "uts", "uas"] as const).map((f) => (
                  <NField key={f} label={f === "tugas" ? "Tugas" : f === "uh" ? "Ulangan Harian" : f === "uts" ? "UTS" : "UAS"}>
                    <input type="number" min={0} max={100} className={inp} value={form[f]} onChange={(e) => up(f, e.target.value)} placeholder="0–100" />
                  </NField>
                ))}
              </div>
              <NField label="Nilai Akhir (kosongkan = hitung otomatis)">
                <input type="number" min={0} max={100} className={inp} value={form.nilai_akhir} onChange={(e) => up("nilai_akhir", e.target.value)} placeholder={calcNA() || "Otomatis"} />
              </NField>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Formula: 20% Tugas + 20% UH + 30% UTS + 30% UAS</p>
              {formError && <p className="text-destructive" style={{ fontSize: "12px" }}>{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors" style={{ fontSize: "13px" }}>Batal</button>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {saving ? "Menyimpan..." : editTarget ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 500 }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}
