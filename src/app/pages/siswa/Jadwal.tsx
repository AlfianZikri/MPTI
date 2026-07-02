import { useState, useEffect } from "react";
import { supabase, type Jadwal } from "../../../lib/supabase";

const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const mapelColor: Record<string, string> = {
  Matematika: "#1B3A6B",
  "Bahasa Indonesia": "#2D6A4F",
  IPA: "#7C3AED",
  IPS: "#C8972B",
  PKn: "#DC2626",
  SBdP: "#DB2777",
  PJOK: "#EA580C",
  PAI: "#0891B2",
};

const today = new Date().toLocaleDateString("id-ID", { weekday: "long" });
const todayKey = hari.find((h) => today.toLowerCase().includes(h.toLowerCase())) ?? "Senin";

export function SiswaJadwal() {
  const [jadwalData, setJadwalData] = useState<Record<string, Jadwal[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("jadwal")
      .select("*")
      .eq("kelas", "VI A")
      .order("urutan", { ascending: true })
      .then(({ data }) => {
        if (data) {
          const grouped: Record<string, Jadwal[]> = {};
          for (const j of data as Jadwal[]) {
            if (!grouped[j.hari]) grouped[j.hari] = [];
            grouped[j.hari].push(j);
          }
          setJadwalData(grouped);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Jadwal Pelajaran
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Kelas VI A · Semester Genap 2025/2026</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {hari.map((h) => (
            <div key={h} className="bg-card border border-border animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {hari.map((h) => (
            <div
              key={h}
              className="bg-card border overflow-hidden"
              style={{ borderColor: h === todayKey ? "var(--primary)" : "var(--border)" }}
            >
              <div
                className="px-4 py-3"
                style={{ backgroundColor: h === todayKey ? "var(--primary)" : "var(--secondary)" }}
              >
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    color: h === todayKey ? "#fff" : "var(--foreground)",
                  }}
                >
                  {h}
                </p>
                {h === todayKey && (
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>Hari ini</p>
                )}
              </div>
              <div className="p-3 space-y-2">
                {(jadwalData[h] ?? []).map((j, i) => {
                  const isBreak = j.mapel === "Istirahat";
                  const color = mapelColor[j.mapel];
                  return (
                    <div
                      key={i}
                      className="px-3 py-2"
                      style={{
                        backgroundColor: isBreak ? "var(--muted)" : color ? color + "12" : "var(--secondary)",
                        borderLeft: isBreak ? "none" : `3px solid ${color ?? "var(--border)"}`,
                      }}
                    >
                      <p style={{ fontSize: "10px", color: "var(--muted-foreground)", marginBottom: "1px" }}>{j.jam}</p>
                      <p style={{ fontSize: "12px", fontWeight: isBreak ? 400 : 600, color: isBreak ? "var(--muted-foreground)" : "var(--foreground)" }}>
                        {j.mapel}
                      </p>
                      {!isBreak && (
                        <p style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{j.guru_nama}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
