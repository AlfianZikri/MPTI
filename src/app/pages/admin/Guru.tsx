import { useState, useEffect } from "react";
import { Plus, Pencil, Mail, Phone, Trash2, X } from "lucide-react";
import { supabase, type Guru } from "../../../lib/supabase";

const statusColors: Record<string, { bg: string; text: string }> = {
  PNS: { bg: "#DBEAFE", text: "#1E40AF" },
  PPPK: { bg: "#D1FAE5", text: "#065F46" },
  GTT: { bg: "#FEF3C7", text: "#92400E" },
};

const emptyForm = { nama: "", jabatan: "", mapel: "—", pendidikan: "", status: "PNS" as Guru["status"], email: "", telepon: "" };
const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";

export function AdminGuru() {
  const [guru, setGuru] = useState<Guru[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Guru | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchGuru(); }, []);

  async function fetchGuru() {
    setLoading(true);
    const { data } = await supabase.from("guru").select("*").order("created_at", { ascending: true });
    if (data) setGuru(data as Guru[]);
    setLoading(false);
  }

  function openAdd() { setEditTarget(null); setForm(emptyForm); setFormError(""); setShowModal(true); }
  function openEdit(g: Guru) {
    setEditTarget(g);
    setForm({ nama: g.nama, jabatan: g.jabatan, mapel: g.mapel, pendidikan: g.pendidikan, status: g.status, email: g.email ?? "", telepon: g.telepon ?? "" });
    setFormError(""); setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim() || !form.jabatan.trim()) { setFormError("Nama dan jabatan wajib diisi."); return; }
    setSaving(true); setFormError("");

    const payload = { nama: form.nama.trim(), jabatan: form.jabatan.trim(), mapel: form.mapel.trim() || "—", pendidikan: form.pendidikan.trim(), status: form.status, email: form.email || null, telepon: form.telepon || null };

    if (editTarget) {
      const { error } = await supabase.from("guru").update(payload).eq("id", editTarget.id);
      if (error) { setFormError(error.message); setSaving(false); return; }
      setGuru((prev) => prev.map((g) => g.id === editTarget.id ? { ...g, ...payload } : g));
    } else {
      const { data, error } = await supabase.from("guru").insert([payload]).select().single();
      if (error) { setFormError(error.message); setSaving(false); return; }
      if (data) setGuru((prev) => [...prev, data as Guru]);
    }
    setSaving(false); setShowModal(false);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data guru ini?")) return;
    const { error } = await supabase.from("guru").delete().eq("id", id);
    if (!error) setGuru((prev) => prev.filter((g) => g.id !== id));
  }

  function up(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Data Guru & Staf</h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Total {guru.length} tenaga pendidik & kependidikan</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
          <Plus size={15} /> Tambah Guru
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-card border border-border p-5 animate-pulse h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {guru.map((g) => {
            const sc = statusColors[g.status] ?? statusColors.GTT;
            const initials = g.nama.replace(/[^A-Z]/g, "").slice(0, 2) || g.nama.slice(0, 2).toUpperCase();
            return (
              <div key={g.id} className="bg-card border border-border p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>{initials}</span>
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.3 }}>{g.nama}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{g.jabatan}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mb-4">
                  <p style={{ fontSize: "11px" }} className="text-muted-foreground">Bidang: <span className="text-foreground">{g.mapel}</span></p>
                  <p style={{ fontSize: "11px" }} className="text-muted-foreground">Pendidikan: <span className="text-foreground">{g.pendidikan}</span></p>
                  {g.email && <p style={{ fontSize: "11px" }} className="text-muted-foreground">Email: <span className="text-foreground">{g.email}</span></p>}
                  {g.telepon && <p style={{ fontSize: "11px" }} className="text-muted-foreground">Telp: <span className="text-foreground">{g.telepon}</span></p>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>{g.status}</span>
                  <div className="flex gap-2">
                    {g.email && (
                      <a href={`mailto:${g.email}`} className="text-muted-foreground hover:text-primary transition-colors" title="Kirim email">
                        <Mail size={13} />
                      </a>
                    )}
                    {g.telepon && (
                      <a href={`tel:${g.telepon}`} className="text-muted-foreground hover:text-primary transition-colors" title="Hubungi">
                        <Phone size={13} />
                      </a>
                    )}
                    <button onClick={() => openEdit(g)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit"><Pencil size={13} /></button>
                    <button onClick={() => hapus(g.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Hapus"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && guru.length === 0 && (
        <p className="text-center text-muted-foreground py-12" style={{ fontSize: "13px" }}>Belum ada data guru.</p>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                {editTarget ? "Edit Data Guru" : "Tambah Guru / Staf"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <GField label="Nama Lengkap" required>
                  <input className={inp} value={form.nama} onChange={(e) => up("nama", e.target.value)} placeholder="Dra. Sri Wahyuni, M.Pd." required />
                </GField>
                <div className="grid grid-cols-2 gap-4">
                  <GField label="Jabatan" required>
                    <input className={inp} value={form.jabatan} onChange={(e) => up("jabatan", e.target.value)} placeholder="Kepala Sekolah" required />
                  </GField>
                  <GField label="Mata Pelajaran / Bidang">
                    <input className={inp} value={form.mapel} onChange={(e) => up("mapel", e.target.value)} placeholder="Matematika / —" />
                  </GField>
                  <GField label="Pendidikan Terakhir">
                    <input className={inp} value={form.pendidikan} onChange={(e) => up("pendidikan", e.target.value)} placeholder="S1 PGSD" />
                  </GField>
                  <GField label="Status Kepegawaian">
                    <select className={`${inp} cursor-pointer`} value={form.status} onChange={(e) => up("status", e.target.value)}>
                      <option value="PNS">PNS</option>
                      <option value="PPPK">PPPK</option>
                      <option value="GTT">GTT</option>
                    </select>
                  </GField>
                  <GField label="Email">
                    <input type="email" className={inp} value={form.email} onChange={(e) => up("email", e.target.value)} placeholder="guru@sekolah.com" />
                  </GField>
                  <GField label="No. Telepon">
                    <input type="tel" className={inp} value={form.telepon} onChange={(e) => up("telepon", e.target.value)} placeholder="08xx-xxxx-xxxx" />
                  </GField>
                </div>
              </div>
              {formError && <p className="text-destructive" style={{ fontSize: "12px" }}>{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors" style={{ fontSize: "13px" }}>Batal</button>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambah Guru"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function GField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 500 }}>
        {label.toUpperCase()} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
