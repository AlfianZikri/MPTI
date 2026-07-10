import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase, type Berita } from "../../lib/supabase";

const categoryColor: Record<string, string> = {
  Prestasi: "#1B3A6B",
  Kegiatan: "#2D6A4F",
  Pengumuman: "#C8972B",
  Akademik: "#7C3AED",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function News() {
  const [news, setNews] = useState<Berita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("berita")
      .select("*")
      .eq("status", "Publikasi")
      .order("tanggal", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setNews(data as Berita[]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="berita" className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p
              className="text-accent mb-3 tracking-widest uppercase"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              Berita & Pengumuman
            </p>
            <h2
              className="text-foreground"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Kabar Terbaru
              <br />
              dari Sekolah
            </h2>
          </div>
          <a
            href="#"
            className="flex items-center gap-2 text-primary border-b border-primary pb-0.5 hover:gap-3 transition-all"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Lihat semua berita <ArrowRight size={14} />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-[200px] mb-5" />
                <div className="bg-muted h-4 w-1/2 mb-3 rounded" />
                <div className="bg-muted h-5 w-full mb-2 rounded" />
                <div className="bg-muted h-4 w-full rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article key={item.id} className="group cursor-pointer">
                <div className="overflow-hidden mb-5 bg-muted" style={{ height: "200px" }}>
                  {item.img_url ? (
                    <img
                      src={item.img_url}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tidak ada gambar</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-primary-foreground px-2 py-0.5"
                    style={{
                      backgroundColor: categoryColor[item.kategori] ?? "#1B3A6B",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.kategori}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
                    {formatDate(item.tanggal)}
                  </span>
                </div>
                <h3
                  className="text-foreground mb-2 group-hover:text-primary transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "17px",
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {item.judul}
                </h3>
                <p className="text-muted-foreground" style={{ fontSize: "13px", lineHeight: 1.7 }}>
                  {item.excerpt}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
