import { useEffect, useState } from "react";
import { BookOpen, Calculator, Palette, Music, Trophy, Globe, Leaf, Cpu, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase, type Program } from "../../lib/supabase";

// Map icon_name strings (stored in DB) → Lucide component
const iconMap: Record<string, LucideIcon> = {
  BookOpen, Calculator, Palette, Music, Trophy, Globe, Leaf, Cpu, Star,
};

export function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("program")
      .select("*")
      .order("urutan", { ascending: true })
      .then(({ data }) => {
        if (data) setPrograms(data as Program[]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="program" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 grid grid-cols-1 lg:grid-cols-2 gap-6 items-end">
          <div>
            <p className="text-accent mb-3 tracking-widest uppercase" style={{ fontSize: "12px", fontWeight: 600 }}>
              Program Unggulan
            </p>
            <h2
              className="text-foreground"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.2 }}
            >
              Kurikulum Lengkap
              <br />
              untuk Tumbuh Optimal
            </h2>
          </div>
          <p className="text-muted-foreground" style={{ fontSize: "15px", lineHeight: 1.8 }}>
            Kami menyediakan program inti yang dirancang untuk mengembangkan potensi akademik, seni, olahraga,
            dan karakter setiap siswa secara menyeluruh.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card p-8 animate-pulse h-44" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {programs.map((p) => {
              const Icon = iconMap[p.icon_name] ?? Star;
              return (
                <div key={p.id} className="bg-card p-8 hover:bg-secondary transition-colors group cursor-default">
                  <div className="w-10 h-10 bg-secondary group-hover:bg-primary flex items-center justify-center mb-5 transition-colors">
                    <Icon size={18} className="text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3
                    className="text-foreground mb-3"
                    style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 600, lineHeight: 1.3 }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.7 }}>
                    {p.deskripsi}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
