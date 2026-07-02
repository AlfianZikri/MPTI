import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase, type Siswa } from "../../../lib/supabase";

const kelasOptions = ["I A", "I B", "II A", "II B", "III A", "III B", "IV A", "IV B", "V A", "V B", "VI A", "VI B"];
const kelasFilter = ["Semua Kelas", ...kelasOptions];
const agamaOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];

const emptyForm = {
  nisn: "", nama: "", kelas: "VI A", jk: "L" as "L" | "P",
  tempat_lahir: "", tgl_lahir: "", agama: "Islam", alamat: "", status: "Aktif" as "Aktif" | "Tidak Aktif",
};

const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";
const sel = `${inp} cursor-pointer`;

export function AdminSiswa() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("Semua Kelas");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Siswa | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchSiswa(); }, []);

  async function fetchSiswa() {
    setLoading(true);
    const { data } = await supabase.from("siswa").select("*").order("nama", { ascending: true });
    if (data) setSiswa(data as Siswa[]);
    setLoading(false);
  }

  const filtered = siswa.filter((s) => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nisn.includes(search);
    const matchKelas = kelas === "Semua Kelas" || s.kelas === kelas;
    return matchSearch && matchKelas;
  });

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(s: Siswa) {
    setEditTarget(s);
    setForm({
      nisn: s.nisn,
      nama: s.nama,
      kelas: s.kelas,
      jk: s.jk,
      tempat_lahir: s.tempat_lahir ?? "",
      tgl_lahir: s.tgl_lahir ?? "",
      agama: s.agama ?? "Islam",
      alamat: s.alamat ?? "",
      status: s.status,
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nisn.trim() || !form.nama.trim()) { setFormError("NISN dan nama wajib diisi."); return; }
    setSaving(true); setFormError("");

    const payload = {
      nisn: form.nisn.trim(),
      nama: form.nama.trim(),
      kelas: form.kelas,
      jk: form.jk,
      tempat_lahir: form.tempat_lahir || null,
      tgl_lahir: form.tgl_lahir || null,
      agama: form.agama || null,
      alamat: form.alamat || null,
      status: form.status,
    };

    if (editTarget) {
      const { error } = await supabase.from("siswa").update(payload).eq("id", editTarget.id);
      if (error) { setFormError(error.message); setSaving(false); return; }
      setSiswa((prev) => prev.map((s) => s.id === editTarget.id ? { ...s, ...payload } : s));
    } else {
      const { data, error } = await supabase.from("siswa").insert([payload]).select().single();
      if (error) { setFormError(error.message); setSaving(false); return; }
      if (data) setSiswa((prev) => [...prev, data as Siswa].sort((a, b) => a.nama.localeCompare(b.nama)));
    }
    setSaving(false); setShowModal(false);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data siswa ini? Semua nilai, absensi, dan SPP terkait juga akan dihapus.")) return;
    const { error } = await supabase.from("siswa").delete().eq("id", id);
    if (!error) setSiswa((prev) => prev.filter((s) => s.id !== id));
  }

  function formatTtl(s: Siswa) {
    if (!s.tempat_lahir && !s.tgl_lahir) return "-";
    const tgl = s.tgl_lahir ? new Date(s.tgl_lahir).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";
    return [s.tempat_lahir, tgl].filter(Boolean).join(", ");
  }

  function up(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Data Siswa</h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Total {siswa.length} siswa terdaftar</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
          <Plus size={15} /> Tambah Siswa
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Cari nama atau NISN..." className="w-full border border-border bg-card text-foreground pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary transition-colors" style={{ fontSize: "13px" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border border-border bg-card text-foreground px-4 py-2.5 focus:outline-none focus:border-primary transition-colors" style={{ fontSize: "13px" }} value={kelas} onChange={(e) => setKelas(e.target.value)}>
          {kelasFilter.map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Memuat data...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {["No", "NISN", "Nama Lengkap", "Kelas", "JK", "Tempat, Tgl Lahir", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{i + 1}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "12px", fontFamily: "monospace" }}>{s.nisn}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{s.nama}</td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "12px" }}>{s.kelas}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{s.jk}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{formatTtl(s)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: s.status === "Aktif" ? "#D1FAE5" : "#FEE2E2", color: s.status === "Aktif" ? "#065F46" : "#991B1B" }}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => hapus(s.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Hapus"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground" style={{ fontSize: "13px" }}>Tidak ada data siswa yang ditemukan.</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                {editTarget ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="NISN" required>
                  <input className={inp} value={form.nisn} onChange={(e) => up("nisn", e.target.value)} placeholder="0123456789" required />
                </Field>
                <Field label="Nama Lengkap" required>
                  <input className={inp} value={form.nama} onChange={(e) => up("nama", e.target.value)} placeholder="Muhammad Farhan" required />
                </Field>
                <Field label="Kelas" required>
                  <select className={sel} value={form.kelas} onChange={(e) => up("kelas", e.target.value)}>
                    {kelasOptions.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </Field>
                <Field label="Jenis Kelamin" required>
                  <select className={sel} value={form.jk} onChange={(e) => up("jk", e.target.value)}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </Field>
                <Field label="Tempat Lahir">
                  <input className={inp} value={form.tempat_lahir} onChange={(e) => up("tempat_lahir", e.target.value)} placeholder="Semarang" />
                </Field>
                <Field label="Tanggal Lahir">
                  <input type="date" className={inp} value={form.tgl_lahir} onChange={(e) => up("tgl_lahir", e.target.value)} />
                </Field>
                <Field label="Agama">
                  <select className={sel} value={form.agama} onChange={(e) => up("agama", e.target.value)}>
                    {agamaOptions.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select className={sel} value={form.status} onChange={(e) => up("status", e.target.value)}>
                    <option>Aktif</option>
                    <option>Tidak Aktif</option>
                  </select>
                </Field>
              </div>
              <Field label="Alamat">
                <textarea className={inp} rows={2} value={form.alamat} onChange={(e) => up("alamat", e.target.value)} placeholder="Jl. Raya Suro No. 1" />
              </Field>
              {formError && <p className="text-destructive" style={{ fontSize: "12px" }}>{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors" style={{ fontSize: "13px" }}>Batal</button>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambah Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 500 }}>
        {label.toUpperCase()} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
