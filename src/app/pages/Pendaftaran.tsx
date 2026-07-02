import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";

const steps = ["Data Calon Siswa", "Data Orang Tua", "Dokumen", "Konfirmasi"];

const kelurahanOptions = ["Suro", "Karanggede", "Pabelan", "Semowo", "Jembrak"];
const agamaOptions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];

export function PendaftaranPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [form, setForm] = useState({
    namaLengkap: "",
    namaKecil: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    alamat: "",
    kelurahan: "",
    namaAyah: "",
    namaIbu: "",
    pekerjaanAyah: "",
    pekerjaanIbu: "",
    noHpOrtu: "",
    emailOrtu: "",
    namaWali: "",
    noHpWali: "",
    akteCheck: false,
    kkCheck: false,
    fotoCheck: false,
    ijazahCheck: false,
    raportCheck: false,
  });

  function up(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    setSaving(true);
    setSaveError("");

    const nomorBaru = `PPDB-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const { error } = await supabase.from("pendaftaran").insert([{
      nomor_pendaftaran: nomorBaru,
      nama_lengkap: form.namaLengkap,
      nama_kecil: form.namaKecil,
      tempat_lahir: form.tempatLahir,
      tanggal_lahir: form.tanggalLahir || null,
      jenis_kelamin: form.jenisKelamin,
      agama: form.agama,
      alamat: form.alamat,
      kelurahan: form.kelurahan,
      nama_ayah: form.namaAyah,
      nama_ibu: form.namaIbu,
      pekerjaan_ayah: form.pekerjaanAyah,
      pekerjaan_ibu: form.pekerjaanIbu,
      no_hp_ortu: form.noHpOrtu,
      email_ortu: form.emailOrtu,
      nama_wali: form.namaWali,
      no_hp_wali: form.noHpWali,
      akte_check: form.akteCheck,
      kk_check: form.kkCheck,
      foto_check: form.fotoCheck,
      ijazah_check: form.ijazahCheck,
      raport_check: form.raportCheck,
    }]);

    if (error) {
      setSaveError("Gagal menyimpan pendaftaran. Silakan coba lagi.");
      setSaving(false);
      return;
    }

    setNomorPendaftaran(nomorBaru);
    setSubmitted(true);
    setSaving(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={28} className="text-primary-foreground" />
          </div>
          <h2
            className="text-foreground mb-3"
            style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700 }}
          >
            Pendaftaran Berhasil!
          </h2>
          <p className="text-muted-foreground mb-4" style={{ fontSize: "15px", lineHeight: 1.8 }}>
            Formulir pendaftaran atas nama <strong className="text-foreground">{form.namaLengkap || "Calon Siswa"}</strong> telah
            kami terima. Nomor pendaftaran Anda:
          </p>
          <div className="bg-secondary border border-border px-6 py-4 mb-8">
            <p className="text-primary"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}
          >
            {nomorPendaftaran}
          </p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>
              Simpan nomor ini untuk pengecekan status
            </p>
          </div>
          <p className="text-muted-foreground mb-8" style={{ fontSize: "13px", lineHeight: 1.7 }}>
            Tim kami akan menghubungi Anda melalui nomor{" "}
            <strong className="text-foreground">{form.noHpOrtu || "-"}</strong> dalam 3 hari kerja.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 hover:bg-primary/90 transition-colors"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> Beranda
          </Link>
          <p
            className="text-primary-foreground"
            style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 600 }}
          >
            PPDB 2026/2027 · SD Negeri 1 Suro
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1
          className="text-foreground mb-2"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700 }}
        >
          Pendaftaran Peserta Didik Baru
        </h1>
        <p className="text-muted-foreground mb-10" style={{ fontSize: "14px" }}>
          Tahun Ajaran 2026/2027 · Kelas 1 SD Negeri 1 Suro
        </p>

        {/* Steps */}
        <div className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: i <= step ? "var(--primary)" : "var(--muted)",
                    color: i <= step ? "#fff" : "var(--muted-foreground)",
                  }}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: i === step ? 600 : 400,
                    color: i === step ? "var(--foreground)" : "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className="text-muted-foreground mx-3 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 0: Data Calon Siswa */}
          {step === 0 && (
            <div className="space-y-5">
              <SectionTitle>Data Calon Siswa</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama Lengkap (sesuai akta)" required>
                  <input type="text" className={inp} value={form.namaLengkap} onChange={(e) => up("namaLengkap", e.target.value)} placeholder="Muhammad Farhan Hidayat" required />
                </Field>
                <Field label="Nama Panggilan">
                  <input type="text" className={inp} value={form.namaKecil} onChange={(e) => up("namaKecil", e.target.value)} placeholder="Farhan" />
                </Field>
                <Field label="Tempat Lahir" required>
                  <input type="text" className={inp} value={form.tempatLahir} onChange={(e) => up("tempatLahir", e.target.value)} placeholder="Semarang" required />
                </Field>
                <Field label="Tanggal Lahir" required>
                  <input type="date" className={inp} value={form.tanggalLahir} onChange={(e) => up("tanggalLahir", e.target.value)} required />
                </Field>
                <Field label="Jenis Kelamin" required>
                  <select className={inp} value={form.jenisKelamin} onChange={(e) => up("jenisKelamin", e.target.value)} required>
                    <option value="">-- Pilih --</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                  </select>
                </Field>
                <Field label="Agama" required>
                  <select className={inp} value={form.agama} onChange={(e) => up("agama", e.target.value)} required>
                    <option value="">-- Pilih --</option>
                    {agamaOptions.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Alamat Lengkap" required>
                <textarea className={inp} rows={3} value={form.alamat} onChange={(e) => up("alamat", e.target.value)} placeholder="Dusun Krajan RT 02 RW 01" required />
              </Field>
              <Field label="Kelurahan / Desa" required>
                <select className={inp} value={form.kelurahan} onChange={(e) => up("kelurahan", e.target.value)} required>
                  <option value="">-- Pilih --</option>
                  {kelurahanOptions.map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* Step 1: Data Orang Tua */}
          {step === 1 && (
            <div className="space-y-5">
              <SectionTitle>Data Ayah</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama Lengkap Ayah" required>
                  <input type="text" className={inp} value={form.namaAyah} onChange={(e) => up("namaAyah", e.target.value)} placeholder="Hendra Wijaya" required />
                </Field>
                <Field label="Pekerjaan Ayah" required>
                  <input type="text" className={inp} value={form.pekerjaanAyah} onChange={(e) => up("pekerjaanAyah", e.target.value)} placeholder="Wiraswasta" required />
                </Field>
              </div>
              <SectionTitle>Data Ibu</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama Lengkap Ibu" required>
                  <input type="text" className={inp} value={form.namaIbu} onChange={(e) => up("namaIbu", e.target.value)} placeholder="Sri Rahayu" required />
                </Field>
                <Field label="Pekerjaan Ibu" required>
                  <input type="text" className={inp} value={form.pekerjaanIbu} onChange={(e) => up("pekerjaanIbu", e.target.value)} placeholder="Ibu Rumah Tangga" required />
                </Field>
              </div>
              <SectionTitle>Kontak Orang Tua / Wali</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="No. HP Aktif" required>
                  <input type="tel" className={inp} value={form.noHpOrtu} onChange={(e) => up("noHpOrtu", e.target.value)} placeholder="08xx-xxxx-xxxx" required />
                </Field>
                <Field label="Email">
                  <input type="email" className={inp} value={form.emailOrtu} onChange={(e) => up("emailOrtu", e.target.value)} placeholder="email@contoh.com" />
                </Field>
                <Field label="Nama Wali (jika bukan orang tua)">
                  <input type="text" className={inp} value={form.namaWali} onChange={(e) => up("namaWali", e.target.value)} placeholder="Kosongkan jika sama" />
                </Field>
                <Field label="No. HP Wali">
                  <input type="tel" className={inp} value={form.noHpWali} onChange={(e) => up("noHpWali", e.target.value)} placeholder="08xx-xxxx-xxxx" />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Dokumen */}
          {step === 2 && (
            <div className="space-y-4">
              <SectionTitle>Kelengkapan Dokumen</SectionTitle>
              <p className="text-muted-foreground mb-4" style={{ fontSize: "13px", lineHeight: 1.7 }}>
                Pastikan seluruh dokumen di bawah ini sudah disiapkan. Dokumen asli dan fotokopi akan diverifikasi
                saat datang ke sekolah.
              </p>
              {[
                { field: "akteCheck", label: "Akta Kelahiran (fotokopi)" },
                { field: "kkCheck", label: "Kartu Keluarga (fotokopi)" },
                { field: "fotoCheck", label: "Pas foto 3×4 sebanyak 4 lembar" },
                { field: "ijazahCheck", label: "Ijazah / STTB TK atau surat keterangan" },
                { field: "raportCheck", label: "Raport TK (jika ada)" },
              ].map((doc) => (
                <label
                  key={doc.field}
                  className="flex items-center gap-3 cursor-pointer p-4 border border-border hover:border-primary transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form[doc.field as keyof typeof form] as boolean}
                    onChange={(e) => up(doc.field, e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-foreground" style={{ fontSize: "14px" }}>
                    {doc.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Step 3: Konfirmasi */}
          {step === 3 && (
            <div>
              <SectionTitle>Ringkasan Pendaftaran</SectionTitle>
              <div className="space-y-4 mb-8">
                <SummaryRow label="Nama Calon Siswa" value={form.namaLengkap || "-"} />
                <SummaryRow label="Tempat, Tanggal Lahir" value={form.tempatLahir && form.tanggalLahir ? `${form.tempatLahir}, ${new Date(form.tanggalLahir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : "-"} />
                <SummaryRow label="Jenis Kelamin" value={form.jenisKelamin || "-"} />
                <SummaryRow label="Agama" value={form.agama || "-"} />
                <SummaryRow label="Alamat" value={form.alamat ? `${form.alamat}, Ds. ${form.kelurahan}` : "-"} />
                <SummaryRow label="Nama Ayah" value={form.namaAyah || "-"} />
                <SummaryRow label="Nama Ibu" value={form.namaIbu || "-"} />
                <SummaryRow label="No. HP Orang Tua" value={form.noHpOrtu || "-"} />
              </div>
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input type="checkbox" className="mt-0.5 w-4 h-4 accent-primary" required />
                <span className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.7 }}>
                  Saya menyatakan bahwa seluruh data yang saya isi adalah benar dan dapat
                  dipertanggungjawabkan. Saya bersedia untuk diverifikasi langsung oleh pihak sekolah.
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="border border-border text-foreground px-6 py-2.5 hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              Sebelumnya
            </button>
            <div className="flex flex-col items-end gap-2">
              {saveError && (
                <p className="text-destructive" style={{ fontSize: "12px" }}>{saveError}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground px-8 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-60"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                {saving ? "Menyimpan..." : step < 3 ? "Lanjutkan" : "Kirim Pendaftaran"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = "w-full border border-border bg-card text-foreground px-4 py-2.5 focus:outline-none focus:border-primary transition-colors text-sm";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-foreground border-b border-border pb-2"
      style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600 }}
    >
      {children}
    </p>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-3 border-b border-border">
      <span className="text-muted-foreground w-44 flex-shrink-0" style={{ fontSize: "13px" }}>{label}</span>
      <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{value}</span>
    </div>
  );
}
