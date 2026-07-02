import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export function Hero() {
  const [totalSiswa, setTotalSiswa] = useState<number | null>(null);
  const [totalGuru, setTotalGuru] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("siswa")
      .select("id", { count: "exact", head: true })
      .eq("status", "Aktif")
      .then(({ count }) => setTotalSiswa(count ?? 0));

    supabase
      .from("guru")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setTotalGuru(count ?? 0));
  }, []);

  const stats = [
    { value: "52+", label: "Tahun Berdiri" },
    { value: totalSiswa !== null ? String(totalSiswa) : "…", label: "Siswa Aktif" },
    { value: totalGuru !== null ? String(totalGuru) : "…", label: "Tenaga Pengajar" },
    { value: "12", label: "Ekstrakurikuler" },
  ];

  return (
    <section id="beranda" className="pt-16 min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — text */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20 bg-background">
        <p className="text-accent mb-4 tracking-widest uppercase" style={{ fontSize: "12px", fontWeight: 600 }}>
          Sekolah Dasar Negeri 1 Suro
        </p>
        <h1
          className="text-foreground mb-6 leading-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 3.8rem)", fontWeight: 700, lineHeight: 1.15 }}
        >
          Membangun Generasi
          <br />
          <span className="text-primary">Cerdas & Berkarakter</span>
        </h1>
        <p className="text-muted-foreground mb-10 max-w-md" style={{ fontSize: "16px", lineHeight: 1.75 }}>
          SD Negeri 1 Suro berkomitmen memberikan pendidikan berkualitas, membentuk siswa yang berilmu,
          berakhlak mulia, dan berdaya saing tinggi sejak 1972.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="#program"
            className="bg-primary text-primary-foreground px-7 py-3 hover:bg-primary/90 transition-colors"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Lihat Program
          </a>
          <a
            href="#tentang"
            className="border border-foreground text-foreground px-7 py-3 hover:bg-foreground hover:text-background transition-colors"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Tentang Sekolah
          </a>
        </div>

        {/* Live stats strip */}
        <div className="mt-16 flex gap-10 pt-10 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p
                className="text-primary"
                style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, lineHeight: 1 }}
              >
                {stat.value}
              </p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — image */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1643216755260-cb0bc30473c8?w=900&h=1000&fit=crop&auto=format"
          alt="Siswa belajar di kelas SD Negeri 1 Suro"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute bottom-10 left-0 -translate-x-1/2 bg-accent text-accent-foreground px-6 py-4"
          style={{ minWidth: "180px" }}
        >
          <p style={{ fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}>A</p>
          <p className="mt-1" style={{ fontSize: "12px", fontWeight: 500 }}>Akreditasi Sekolah</p>
        </div>
      </div>
    </section>
  );
}
