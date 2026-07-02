import { useEffect, useState } from "react";
import { supabase, type Galeri } from "../../lib/supabase";

const spanClasses = [
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

export function Gallery() {
  const [photos, setPhotos] = useState<Galeri[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("galeri")
      .select("*")
      .order("urutan", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        if (data) setPhotos(data as Galeri[]);
        setLoading(false);
      });
  }, []);

  return (
    <section id="galeri" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14 text-center">
          <p
            className="text-accent mb-3 tracking-widest uppercase"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            Galeri Foto
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
            Kehidupan di SD Negeri 1 Suro
          </h2>
        </div>

        {loading ? (
          <div
            className="grid gap-3 animate-pulse"
            style={{ gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "220px 220px" }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-muted" />
            ))}
          </div>
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "220px 220px",
            }}
          >
            {photos.map((photo, i) => (
              <div
                key={photo.id}
                className={`overflow-hidden bg-muted ${spanClasses[i] ?? ""}`}
              >
                <img
                  src={photo.src_url}
                  alt={photo.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
