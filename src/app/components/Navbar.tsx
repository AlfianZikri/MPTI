import { useState } from "react";
import { Link } from "react-router";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Program", href: "#program" },
  { label: "Berita", href: "#berita" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#beranda" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>SD</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-foreground text-sm leading-tight" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>SD Negeri 1 Suro</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Kab. Semarang, Jawa Tengah</p>
          </div>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/pendaftaran"
            className="inline-flex items-center bg-accent text-accent-foreground px-4 py-2 hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Daftar
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Masuk
          </Link>
        </div>

        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-6 py-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-foreground"
                  style={{ fontSize: "15px", fontWeight: 500 }}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
