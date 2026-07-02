import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

type Role = "admin" | "siswa" | "wali";

const roles: { id: Role; label: string; desc: string; color: string }[] = [
  { id: "admin", label: "Admin", desc: "Pengelola sekolah & data akademik", color: "#1B3A6B" },
  { id: "siswa", label: "Siswa", desc: "Akses nilai, jadwal & absensi", color: "#2D6A4F" },
  { id: "wali", label: "Wali Murid", desc: "Pantau perkembangan putra/putri", color: "#C8972B" },
];

const demoCredentials: Record<Role, { id: string; pass: string }> = {
  admin: { id: "admin001", pass: "admin123" },
  siswa: { id: "2024.001", pass: "siswa123" },
  wali: { id: "wali.001", pass: "wali123" },
};

const redirectPath: Record<Role, string> = {
  admin: "/admin",
  siswa: "/siswa",
  wali: "/wali",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("siswa");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const creds = demoCredentials[role];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (userId === creds.id && password === creds.pass) {
      setLoading(true);
      setTimeout(() => navigate(redirectPath[role]), 600);
    } else {
      setError("ID atau password salah. Gunakan data demo yang tertera.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-14 bg-primary"
      >
        <Link
          to="/"
          className="flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft size={14} /> Kembali ke Beranda
        </Link>
        <div>
          <div className="w-14 h-14 bg-card flex items-center justify-center mb-8">
            <span className="text-primary" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px" }}>SD</span>
          </div>
          <h1
            className="text-primary-foreground mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 700, lineHeight: 1.15 }}
          >
            Portal Akademik
            <br />
            SD Negeri 1 Suro
          </h1>
          <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#9CAEC7" }}>
            Sistem informasi sekolah terintegrasi untuk siswa, wali murid, dan
            pengelola sekolah. Akses data akademik kapan saja dan di mana saja.
          </p>
        </div>
        <p style={{ fontSize: "12px", color: "#6B6B72" }}>© 2026 SD Negeri 1 Suro · NPSN: 20320547</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2 text-muted-foreground mb-8 self-start"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft size={14} /> Beranda
        </Link>

        <div className="w-full max-w-md">
          <h2
            className="text-foreground mb-2"
            style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700 }}
          >
            Masuk ke Akun
          </h2>
          <p className="text-muted-foreground mb-8" style={{ fontSize: "14px" }}>
            Pilih peran Anda, lalu masukkan kredensial.
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setError(""); }}
                className="p-3 border text-left transition-all"
                style={{
                  borderColor: role === r.id ? r.color : "var(--border)",
                  backgroundColor: role === r.id ? r.color : "var(--card)",
                }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: role === r.id ? "#fff" : "var(--foreground)",
                  }}
                >
                  {r.label}
                </p>
                <p
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.4,
                    marginTop: "2px",
                    color: role === r.id ? "rgba(255,255,255,0.75)" : "var(--muted-foreground)",
                  }}
                >
                  {r.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Demo hint */}
          <div className="bg-secondary border border-border px-4 py-3 mb-6">
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              <strong className="text-foreground">Demo:</strong> ID{" "}
              <code className="bg-muted px-1">{creds.id}</code> · Password{" "}
              <code className="bg-muted px-1">{creds.pass}</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                ID / NIS / Username
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={creds.id}
                className="w-full border border-border bg-card text-foreground px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                style={{ fontSize: "14px" }}
                required
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-border bg-card text-foreground px-4 py-3 pr-11 focus:outline-none focus:border-primary transition-colors"
                  style={{ fontSize: "14px" }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive" style={{ fontSize: "13px" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90 transition-colors disabled:opacity-60"
              style={{ fontSize: "14px", fontWeight: 500 }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
              Belum terdaftar?{" "}
              <Link to="/pendaftaran" className="text-primary hover:underline" style={{ fontWeight: 500 }}>
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
