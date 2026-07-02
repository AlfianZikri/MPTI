import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { Programs } from "../components/Programs";
import { News } from "../components/News";
import { Gallery } from "../components/Gallery";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

export function MainWebsite() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Quick access bar */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <Link
          to="/pendaftaran"
          className="bg-accent text-accent-foreground px-4 py-2.5 shadow-lg hover:opacity-90 transition-opacity text-center"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          Daftar Sekarang
        </Link>
        <Link
          to="/login"
          className="bg-primary text-primary-foreground px-4 py-2.5 shadow-lg hover:opacity-90 transition-opacity text-center"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          Masuk Akun
        </Link>
      </div>
      <Hero />
      <About />
      <Programs />
      <News />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}
