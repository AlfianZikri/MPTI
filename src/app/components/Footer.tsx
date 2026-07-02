export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary flex items-center justify-center">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "12px" }}>SD</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px" }}>
              SD Negeri 1 Suro
            </p>
          </div>
          <p style={{ fontSize: "13px", lineHeight: 1.8, color: "#9CAEC7" }}>
            Sekolah dasar negeri terpercaya di Kecamatan Pabelan, Kabupaten Semarang.
            Mendidik generasi penerus bangsa sejak 1972.
          </p>
        </div>

        <div>
          <p
            className="mb-4 tracking-widest uppercase"
            style={{ fontSize: "11px", fontWeight: 600, color: "#9CAEC7" }}
          >
            Tautan Cepat
          </p>
          <ul className="space-y-2">
            {["Beranda", "Tentang", "Program", "Berita", "Galeri", "Kontak"].map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-accent transition-colors"
                  style={{ fontSize: "13px", color: "#9CAEC7" }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p
            className="mb-4 tracking-widest uppercase"
            style={{ fontSize: "11px", fontWeight: 600, color: "#9CAEC7" }}
          >
            Tautan Resmi
          </p>
          <ul className="space-y-2">
            {[
              "Dinas Pendidikan Kab. Semarang",
              "Kemendikbud RI",
              "Data Pokok Pendidikan",
              "PPDB Online",
            ].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="hover:text-accent transition-colors"
                  style={{ fontSize: "13px", color: "#9CAEC7" }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "#2A2A30" }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontSize: "12px", color: "#6B6B72" }}>
            © 2026 SD Negeri 1 Suro. Hak cipta dilindungi undang-undang.
          </p>
          <p style={{ fontSize: "12px", color: "#6B6B72" }}>
            NPSN: 20320547 · Terakreditasi A
          </p>
        </div>
      </div>
    </footer>
  );
}
