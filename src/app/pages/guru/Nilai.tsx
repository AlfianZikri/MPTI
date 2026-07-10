import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle } from "lucide-react";
import { supabase, type Nilai, type Siswa } from "../../../lib/supabase";

const emptyForm = { siswa_id: "", kelas: "", mapel: "", semester: "1", tahun_ajaran: "2025/2026", tugas: "", uh: "", uts: "", uas: "" };
const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";

export function GuruNilai() {
  const [nilai, setNilai] = useState<(Nilai & { siswa?: Siswa })[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Nilai | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    if (!supabase) {
      setNilai([]);
      setSiswaList([]);
      setLoading(false);
      return;
    }
    const [nilaiRes, siswaRes] = await Promise.all([
      supabase.from("nilai").select("*, siswa:siswa_id(*)").order("created_at", { ascending: false }),
      supabase.from("siswa").select("*").order("nama", { ascending: true }),
    ]);
    if (nilaiRes.data) setNilai(nilaiRes.data as any);
    if (siswaRes.data) setSiswaList(siswaRes.data as Siswa[]);
    setLoading(false);
  }

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  function openEdit(n: Nilai) {
    setEditTarget(n);
    setForm({
      siswa_id: n.siswa_id,
      kelas: n.kelas,
      mapel: n.mapel,
      semester: n.semester,
      tahun_ajaran: n.tahun_ajaran,
      tugas: n.tugas ? String(n.tugas) : "",
      uh: n.uh ? String(n.uh) : "",
      uts: n.uts ? String(n.uts) : "",
      uas: n.uas ? String(n.uas) : "",
    });
    setFormError("");
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.siswa_id || !form.mapel) {
      setFormError("Siswa dan mata pelajaran wajib diisi.");
      return;
    }

    if (!supabase) {
      setFormError("Database tidak tersedia. Silakan cek koneksi Supabase Anda.");
      return;
    }

    setSaving(true);
    setFormError("");

    const tugas = form.tugas ? parseFloat(form.tugas) : null;
    const uh = form.uh ? parseFloat(form.uh) : null;
    const uts = form.uts ? parseFloat(form.uts) : null;
    const uas = form.uas ? parseFloat(form.uas) : null;

    const payload = {
      siswa_id: form.siswa_id,
      kelas: form.kelas,
      mapel: form.mapel.trim(),
      semester: form.semester,
      tahun_ajaran: form.tahun_ajaran,
      tugas,
      uh,
      uts,
      uas,
    };

    if (editTarget) {
      const { error } = await supabase.from("nilai").update(payload).eq("id", editTarget.id);
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
      setNilai((prev) => prev.map((n) => (n.id === editTarget.id ? { ...n, ...payload } : n)));
    } else {
      const { data, error } = await supabase.from("nilai").insert([payload]).select("*, siswa:siswa_id(*)").single();
      if (error) {
        setFormError(error.message);
        setSaving(false);
        return;
      }
      if (data) setNilai((prev) => [data as any, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data nilai ini?")) return;
    if (!supabase) return;
    const { error } = await supabase.from("nilai").delete().eq("id", id);
    if (!error) setNilai((prev) => prev.filter((n) => n.id !== id));
  }

  function up(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const getSiswaName = (siswaId: string) => siswaList.find((s) => s.id === siswaId)?.nama || "—";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
            Input Nilai Siswa
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Total {nilai.length} data nilai</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <Plus size={15} /> Tambah Nilai
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-card border border-border p-4 animate-pulse h-16" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "13px" }}>
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground p-3 font-medium">Siswa</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Kelas</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Mata Pelajaran</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Semester</th>
                <th className="text-center text-muted-foreground p-3 font-medium">Tugas</th>
                <th className="text-center text-muted-foreground p-3 font-medium">UH</th>
                <th className="text-center text-muted-foreground p-3 font-medium">UTS</th>
                <th className="text-center text-muted-foreground p-3 font-medium">UAS</th>
                <th className="text-center text-muted-foreground p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {nilai.map((n) => (
                <tr key={n.id} className="border-b border-border hover:bg-card/50 transition-colors">
                  <td className="p-3 text-foreground">{getSiswaName(n.siswa_id)}</td>
                  <td className="p-3 text-foreground">{n.kelas}</td>
                  <td className="p-3 text-foreground">{n.mapel}</td>
                  <td className="p-3 text-foreground">{n.semester}</td>
                  <td className="p-3 text-center text-muted-foreground">{n.tugas || "—"}</td>
                  <td className="p-3 text-center text-muted-foreground">{n.uh || "—"}</td>
                  <td className="p-3 text-center text-muted-foreground">{n.uts || "—"}</td>
                  <td className="p-3 text-center text-muted-foreground">{n.uas || "—"}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(n)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => hapus(n.id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Hapus">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && nilai.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={32} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
            Belum ada data nilai.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                {editTarget ? "Edit Nilai" : "Tambah Nilai"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GField label="Siswa" required>
                  <select className={`${inp} cursor-pointer`} value={form.siswa_id} onChange={(e) => up("siswa_id", e.target.value)} required>
                    <option value="">Pilih Siswa</option>
                    {siswaList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama}
                      </option>
                    ))}
                  </select>
                </GField>
                <GField label="Mata Pelajaran" required>
                  <input className={inp} value={form.mapel} onChange={(e) => up("mapel", e.target.value)} placeholder="Matematika" required />
                </GField>
                <GField label="Kelas">
                  <input className={inp} value={form.kelas} onChange={(e) => up("kelas", e.target.value)} placeholder="VI A" />
                </GField>
                <GField label="Semester">
                  <select className={`${inp} cursor-pointer`} value={form.semester} onChange={(e) => up("semester", e.target.value)}>
                    <option value="1">Semester 1 (Ganjil)</option>
                    <option value="2">Semester 2 (Genap)</option>
                  </select>
                </GField>
                <GField label="Tugas">
                  <input type="number" className={inp} value={form.tugas} onChange={(e) => up("tugas", e.target.value)} placeholder="0—100" min="0" max="100" />
                </GField>
                <GField label="UH (Ulangan Harian)">
                  <input type="number" className={inp} value={form.uh} onChange={(e) => up("uh", e.target.value)} placeholder="0—100" min="0" max="100" />
                </GField>
                <GField label="UTS (Ulangan Tengah Semester)">
                  <input type="number" className={inp} value={form.uts} onChange={(e) => up("uts", e.target.value)} placeholder="0—100" min="0" max="100" />
                </GField>
                <GField label="UAS (Ulangan Akhir Semester)">
                  <input type="number" className={inp} value={form.uas} onChange={(e) => up("uas", e.target.value)} placeholder="0—100" min="0" max="100" />
                </GField>
              </div>
              {formError && <p className="text-destructive" style={{ fontSize: "12px" }}>{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors" style={{ fontSize: "13px" }}>
                  Batal
                </button>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {saving ? "Menyimpan..." : editTarget ? "Simpan Perubahan" : "Tambah Nilai"}
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
