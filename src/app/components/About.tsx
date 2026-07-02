import { CheckCircle } from "lucide-react";

const pillars = [
  "Kurikulum Merdeka Belajar",
  "Pendidikan karakter terintegrasi",
  "Fasilitas laboratorium sains",
  "Program literasi digital",
  "Lingkungan belajar inklusif",
  "Guru bersertifikat nasional",
];

export function About() {
  return (
    <section id="tentang" className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Image column */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1742549586702-c23994895082?w=700&h=500&fit=crop&auto=format"
            alt="Siswa SD Negeri 1 Suro mengerjakan ujian"
            className="w-full object-cover"
            style={{ height: "420px" }}
          />
          {/* Side accent */}
          <div className="absolute -left-4 top-8 w-1 bg-accent" style={{ height: "80px" }} />
        </div>

        {/* Text column */}
        <div>
          <p
            className="text-accent mb-3 tracking-widest uppercase"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            Tentang Kami
          </p>
          <h2
            className="text-foreground mb-5"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Mendidik dengan Hati,
            <br />
            Memimpin dengan Ilmu
          </h2>
          <p className="text-muted-foreground mb-4" style={{ fontSize: "15px", lineHeight: 1.8 }}>
            Berdiri sejak 1972, SD Negeri 1 Suro adalah sekolah dasar negeri
            yang berlokasi di Kecamatan Suro, Kabupaten Semarang, Jawa Tengah.
            Kami percaya bahwa setiap anak memiliki potensi unik yang perlu
            dikembangkan dengan pendekatan holistik.
          </p>
          <p className="text-muted-foreground mb-8" style={{ fontSize: "15px", lineHeight: 1.8 }}>
            Visi kami adalah mencetak lulusan yang unggul dalam akademik,
            berkarakter Pancasila, dan siap menghadapi tantangan abad ke-21
            dengan percaya diri.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-foreground" style={{ fontSize: "14px" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
