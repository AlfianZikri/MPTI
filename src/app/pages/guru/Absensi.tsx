import { useState, useEffect } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { supabase, type Absensi, type Siswa } from "../../../lib/supabase";

const emptyForm = { siswa_id: "", tanggal: new Date().toISOString().split("T")[0], status: "Hadir" as const };
const inp = "w-full border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm";

export function GuruAbsensi() {
  const [absensi, setAbsensi] = useState<(Absensi & { siswa?: Siswa })[]>([]);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    if (!supabase) {
      setAbsensi([]);
      setSiswaList([]);
      setLoading(false);
      return;
    }
    const [absensiRes, siswaRes] = await Promise.all([
      supabase.from("absensi").select("*, siswa:siswa_id(*)").order("tanggal", { ascending: false }),
      supabase.from("siswa").select("*").order("nama", { ascending: true }),
    ]);
    if (absensiRes.data) setAbsensi(absensiRes.data as any);
    if (siswaRes.data) setSiswaList(siswaRes.data as Siswa[]);
    setLoading(false);
  }

  function openAdd() {
    setForm(emptyForm);
    setFormError("");
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.siswa_id || !form.tanggal) {
      setFormError("Siswa dan tanggal wajib diisi.");
      return;
    }

    if (!supabase) {
      setFormError("Database tidak tersedia. Silakan cek koneksi Supabase Anda.");
      return;
    }

    setSaving(true);
    setFormError("");

    const { data, error } = await supabase
      .from("absensi")
      .insert([{ siswa_id: form.siswa_id, tanggal: form.tanggal, status: form.status }])
      .select("*, siswa:siswa_id(*)")
      .single();

    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }

    if (data) setAbsensi((prev) => [data as any, ...prev]);
    setSaving(false);
    setShowModal(false);
  }

  async function hapus(id: string) {
    if (!confirm("Hapus data absensi ini?")) return;
    if (!supabase) return;
    const { error } = await supabase.from("absensi").delete().eq("id", id);
    if (!error) setAbsensi((prev) => prev.filter((a) => a.id !== id));
  }

  function up(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const getSiswaName = (siswaId: string) => siswaList.find((s) => s.id === siswaId)?.nama || "—";

  const filteredAbsensi = absensi.filter((a) => {
    if (filterTanggal && a.tanggal !== filterTanggal) return false;
    return true;
  });

  const statusColors: Record<string, { bg: string; text: string }> = {
    Hadir: { bg: "#D1FAE5", text: "#065F46" },
    Sakit: { bg: "#FEF3C7", text: "#92400E" },
    Izin: { bg: "#DBEAFE", text: "#1E40AF" },
    Alpa: { bg: "#FEE2E2", text: "#7F1D1D" },
    Libur: { bg: "#E5E7EB", text: "#374151" },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
            Absensi Siswa
          </h1>
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Pencatatan kehadiran siswa</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 hover:bg-primary/90 transition-colors"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <Plus size={15} /> Tambah Absensi
        </button>
      </div>

      <div className="bg-card border border-border p-4 mb-6">
        <label className="block text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>
          FILTER TANGGAL
        </label>
        <input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="w-full sm:w-48 border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
        />
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
                <th className="text-left text-muted-foreground p-3 font-medium">Tanggal</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Status</th>
                <th className="text-center text-muted-foreground p-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsensi.map((a) => {
                const sc = statusColors[a.status] || statusColors.Hadir;
                return (
                  <tr key={a.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="p-3 text-foreground">{getSiswaName(a.siswa_id)}</td>
                    <td className="p-3 text-foreground">{new Date(a.tanggal).toLocaleDateString("id-ID")}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-white" style={{ fontSize: "11px", fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => hapus(a.id)} className="text-muted-foreground hover:text-destructive transition-colors text-sm" title="Hapus">
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredAbsensi.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={32} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
            Tidak ada data absensi untuk tanggal yang dipilih.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}>
                Tambah Absensi
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
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
              <GField label="Tanggal" required>
                <input type="date" className={inp} value={form.tanggal} onChange={(e) => up("tanggal", e.target.value)} required />
              </GField>
              <GField label="Status" required>
                <select className={`${inp} cursor-pointer`} value={form.status} onChange={(e) => up("status", e.target.value)}>
                  <option value="Hadir">Hadir</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Alpa">Alpa</option>
                  <option value="Libur">Libur</option>
                </select>
              </GField>
              {formError && <p className="text-destructive" style={{ fontSize: "12px" }}>{formError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-border text-foreground px-5 py-2 hover:border-primary transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-primary-foreground px-6 py-2 hover:bg-primary/90 transition-colors disabled:opacity-60"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  {saving ? "Menyimpan..." : "Tambah Absensi"}
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
