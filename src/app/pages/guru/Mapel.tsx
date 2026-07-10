import { useState, useEffect } from "react";
import { BookOpen, Clock, Users } from "lucide-react";
import { supabase, type Jadwal } from "../../../lib/supabase";

export function GuruMapel() {
  const [jadwal, setJadwal] = useState<Jadwal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJadwal();
  }, []);

  async function fetchJadwal() {
    setLoading(true);
    if (!supabase) {
      setJadwal([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("jadwal").select("*").order("urutan", { ascending: true });
    if (data) setJadwal(data as Jadwal[]);
    setLoading(false);
  }

  const hariOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const groupedByHari = hariOrder.map((hari) => ({
    hari,
    jadwal: jadwal.filter((j) => j.hari === hari).sort((a, b) => a.urutan - b.urutan),
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Mata Pelajaran Saya
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Jadwal mengajar dan kelas yang diasuh</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-card border border-border p-4 animate-pulse h-32" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByHari.map((group) => (
            <div key={group.hari}>
              <h2 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                {group.hari}
              </h2>
              {group.jadwal.length === 0 ? (
                <p className="text-muted-foreground text-sm">Tidak ada jadwal</p>
              ) : (
                <div className="space-y-2">
                  {group.jadwal.map((j) => (
                    <div key={j.id} className="bg-card border border-border p-4 hover:border-primary/40 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 flex items-center justify-center">
                            <BookOpen size={16} style={{ color: "#7C3AED" }} />
                          </div>
                          <div>
                            <p className="text-foreground font-medium" style={{ fontSize: "13px" }}>
                              {j.mapel}
                            </p>
                            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                              {j.guru_nama}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={14} />
                          <span style={{ fontSize: "12px" }}>{j.jam}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users size={14} />
                          <span style={{ fontSize: "12px" }}>Kelas {j.kelas}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && jadwal.length === 0 && (
        <p className="text-center text-muted-foreground py-12" style={{ fontSize: "13px" }}>Jadwal mengajar tidak ditemukan.</p>
      )}
    </div>
  );
}
