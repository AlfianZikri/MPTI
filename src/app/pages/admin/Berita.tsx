import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { supabase, type Berita } from "../../../lib/supabase";

const catColor: Record<string, string> = {
  Prestasi: "#1B3A6B",
  Kegiatan: "#2D6A4F",
  Pengumuman: "#C8972B",
  Akademik: "#7C3AED",
};
const categories = Object.keys(catColor) as Berita["kategori"][];
const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";

const emptyForm = { judul: "", kategori: "Pengumuman" as Berita["kategori"], excerpt: "", img_url: "", tanggal: new Date().toISOString().slice(0, 10), status: "Draft" as Berita["status"] };

export function AdminBerita() {
  const [posts, setPosts] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Berita | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchBerita(); }, []);

  async function fetchBerita() {
    setLoading(true);
    const { data } = await supabase.from("berita").select("*").order("tanggal", { ascending: false });
    if (data) setPosts(data as Berita[]);
    setLoading(false);
  }

  function openAdd() {
    setEditTarget(null);
    setForm({ ...emptyForm, tanggal: new Date().toISOString().slice(0, 10) });
    setFormError(""); setShowModal(true);
  }

  function openEdit(p: Berita) {
    setEditTarget(p);
    setForm({ judul: p.judul, kategori: p.kategori, excerpt: p.excerpt ?? "", img_url: p.img_url ?? "", tanggal: p.tanggal, status: p.status });
    setFormError(""); setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul.trim()) { setFormError("Judul wajib diisi."); return; }
    setSaving(true); setFormError("");

    const payload = { judul: form.judul.trim(), kategori: form.kategori, excerpt: form.excerpt || null, img_url: form.img_url || null, tanggal: form.tanggal, status: form.status };

    if (editTarget) {
      const { error } = await supabase.from("berita").update(payload).eq("id", editTarget.id);
      if (error) { setFormError(error.message); setSaving(false); return; }
      setPosts((p) => p.map((x) => x.id === editTarget.id ? { ...x, ...payload } : x));
    } else {
      const { data, error } = await supabase.from("berita").insert([{ ...payload, views: 0 }]).select().single();
      if (error) { setFormError(error.message); setSaving(false); return; }
      if (data) setPosts((p) => [data as Berita, ...p]);
    }
    setSaving(false); setShowModal(false);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus berita ini?")) return;
    await supabase.from("berita").delete().eq("id", id);
    setPosts((p) => p.filter((x) => x.id !== id));
  }

  async function toggleStatus(post: Berita) {
    const newStatus = post.status === "Publikasi" ? "Draft" : "Publikasi";
    await supabase.from("berita").update({ status: newStatus }).eq("id", post.id);
    setPosts((p) => p.map((x) => x.id === post.id ? { ...x, status: newStatus } : x));
  }

  function up(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>Berita & Pengumuman</h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{posts.length} artikel · {posts.filter((p) => p.status === "Publikasi").length} dipublikasikan</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>
          <Plus size={15} /> Tulis Artikel
        </button>
      </div>

      {loading ? (
        <div className="bg-card border border-border p-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>Memuat data...</div>
      ) : (
        <div className="bg-card border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary">
                {["Judul", "Kategori", "Tanggal", "Status", "Tayangan", "Aksi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3" style={{ maxWidth: "300px" }}>
                    <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.4 }}>{p.judul}</p>
                    {p.excerpt && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>{p.excerpt}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-white" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: catColor[p.kategori] ?? "#6B7280", whiteSpace: "nowrap" }}>{p.kategori}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                    {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(p)} className="px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: p.status === "Publikasi" ? "#D1FAE5" : "#FEF3C7", color: p.status === "Publikasi" ? "#065F46" : "#92400E" }}>
                      {p.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <span className="flex items-center gap-1"><Eye size={11} /> {p.views.toLocaleString("id-ID")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => hapus(p.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Hapus"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <div className="text-center py-12 text-muted-foreground" style={{ fontSize: "13px" }}>Belum ada berita.</div>}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                {editTarget ? "Edit Artikel" : "Tulis Artikel Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <BField label="Judul" required>
                <input className={inp} value={form.judul} onChange={(e) => up("judul", e.target.value)} placeholder="Judul artikel..." required />
              </BField>
              <div className="grid grid-cols-2 gap-4">
                <BField label="Kategori">
                  <select className={`${inp} cursor-pointer`} value={form.kategori} onChange={(e) => up("kategori", e.target.value)}>
                    {categories.map((k) => <option key={k}>{k}</option>)}
                  </select>
                </BField>
                <BField label="Tanggal">
                  <input type="date" className={inp} value={form.tanggal} onChange={(e) => up("tanggal", e.target.value)} />
                </BField>
              </div>
              <BField label="Ringkasan / Excerpt">
                <textarea className={inp} rows={3} value={form.excerpt} onChange={(e) => up("excerpt", e.target.value)} placeholder="Ringkasan singkat artikel..." />
              </BField>
              <BField label="URL Gambar (opsional)">
                <input className={inp} value={form.img_url} onChange={(e) => up("img_url", e.target.value)} placeholder="https://..." />
              </BField>
              <BField label="Status">
                <select className={`${inp} cursor-pointer`} value={form.status} onChange={(e) => up("status", e.target.value)}>
                  <option value="Draft">Draft</option>
                  <option value="Publikasi">Publikasi</option>
                </select>
              </BField>
              {formError && <p className="text-destructive" style={{ fontSize: "12px" }}>{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors" style={{ fontSize: "13px" }}>Batal</button>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Publikasikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 500 }}>
        {label.toUpperCase()} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}
