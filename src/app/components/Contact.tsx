import { useState } from "react";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { supabase, type KontakPesan } from "../../lib/supabase";

export function Contact() {
  const [form, setForm] = useState<KontakPesan>({ nama: "", telepon: "", email: "", pesan: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim() || !form.pesan.trim()) return;
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("kontak_pesan").insert([form]);
    if (err) {
      setError("Gagal mengirim pesan. Silakan coba lagi.");
    } else {
      setSuccess(true);
      setForm({ nama: "", telepon: "", email: "", pesan: "" });
    }
    setSubmitting(false);
  }

  return (
    <section id="kontak" className="py-24 bg-primary">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Info */}
        <div>
          <p
            className="text-accent mb-3 tracking-widest uppercase"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            Hubungi Kami
          </p>
          <h2
            className="text-primary-foreground mb-6"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Kami Siap Melayani
            <br />
            Pertanyaan Anda
          </h2>
          <p
            className="mb-10"
            style={{ fontSize: "15px", lineHeight: 1.8, color: "#9CAEC7" }}
          >
            Jangan ragu untuk menghubungi kami melalui telepon, email, atau
            kunjungi langsung kantor kami di jam operasional sekolah.
          </p>

          <div className="space-y-6">
            {[
              {
                icon: MapPin,
                label: "Alamat",
                value: "Jl. Raya Suro No. 1, Desa Suro, Kec. Pabelan, Kab. Semarang, Jawa Tengah 50771",
              },
              { icon: Phone, label: "Telepon", value: "(0298) 712345" },
              { icon: Mail, label: "Email", value: "sdn1suro@disdik.semarangkab.go.id" },
              { icon: Clock, label: "Jam Operasional", value: "Senin – Jumat: 07.00 – 13.00 WIB" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex gap-4">
                <div className="w-10 h-10 bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-accent" />
                </div>
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CAEC7", letterSpacing: "0.06em" }}>
                    {label.toUpperCase()}
                  </p>
                  <p className="text-primary-foreground mt-0.5" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-card p-8 md:p-10">
          <h3
            className="text-foreground mb-6"
            style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600 }}
          >
            Kirim Pesan
          </h3>

          {success ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <CheckCircle size={40} className="text-primary" />
              <p className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 600 }}>
                Pesan Terkirim!
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "14px" }}>
                Terima kasih. Kami akan segera menghubungi Anda.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-primary border-b border-primary"
                style={{ fontSize: "13px" }}
              >
                Kirim pesan lain
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                    Nama Lengkap <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Budi Santoso"
                    required
                    className="w-full border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    style={{ fontSize: "14px" }}
                    value={form.nama}
                    onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    style={{ fontSize: "14px" }}
                    value={form.telepon}
                    onChange={(e) => setForm((f) => ({ ...f, telepon: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  className="w-full border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  style={{ fontSize: "14px" }}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Pesan <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tulis pesan Anda di sini..."
                  className="w-full border border-border bg-background text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                  style={{ fontSize: "14px" }}
                  value={form.pesan}
                  onChange={(e) => setForm((f) => ({ ...f, pesan: e.target.value }))}
                />
              </div>
              {error && (
                <p className="text-destructive" style={{ fontSize: "13px" }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90 transition-colors disabled:opacity-60"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                {submitting ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
