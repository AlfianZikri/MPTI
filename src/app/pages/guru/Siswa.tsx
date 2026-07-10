import { useState, useEffect } from "react";
import { Search, UserCheck } from "lucide-react";
import { supabase, type Siswa } from "../../../lib/supabase";

export function GuruSiswa() {
  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState("All");

  useEffect(() => {
    fetchSiswa();
  }, []);

  async function fetchSiswa() {
    setLoading(true);
    const { data } = await supabase.from("siswa").select("*").order("nama", { ascending: true });
    if (data) setSiswa(data as Siswa[]);
    setLoading(false);
  }

  useEffect(() => {
    let result = siswa;
    if (selectedKelas !== "All") {
      result = result.filter((s) => s.kelas === selectedKelas);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((s) => s.nama.toLowerCase().includes(term) || s.nisn.includes(term));
    }
    setFilteredSiswa(result);
  }, [siswa, searchTerm, selectedKelas]);

  const kelasList = Array.from(new Set(siswa.map((s) => s.kelas))).sort();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-foreground" style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>
          Daftar Siswa
        </h1>
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Data siswa yang akan Anda ajar</p>
      </div>

      <div className="bg-card border border-border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-border bg-background text-foreground pl-9 pr-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="border border-border bg-background text-foreground px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm cursor-pointer"
          >
            <option value="All">Semua Kelas</option>
            {kelasList.map((k) => (
              <option key={k} value={k}>
                Kelas {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="bg-card border border-border p-4 animate-pulse h-16" />)}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "13px" }}>
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground p-3 font-medium">NISN</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Nama Siswa</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Kelas</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Jenis Kelamin</th>
                <th className="text-left text-muted-foreground p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.map((s) => {
                const statusColor = s.status === "Aktif" ? "#10B981" : "#6B7280";
                return (
                  <tr key={s.id} className="border-b border-border hover:bg-card/50 transition-colors">
                    <td className="p-3 text-foreground">{s.nisn}</td>
                    <td className="p-3 text-foreground">{s.nama}</td>
                    <td className="p-3 text-foreground">{s.kelas}</td>
                    <td className="p-3 text-muted-foreground">{s.jk === "L" ? "Laki-laki" : "Perempuan"}</td>
                    <td className="p-3">
                      <span
                        className="px-2 py-1 text-white"
                        style={{ fontSize: "11px", fontWeight: 600, backgroundColor: statusColor }}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredSiswa.length === 0 && (
        <div className="text-center py-12">
          <UserCheck size={32} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
            Tidak ada siswa yang sesuai dengan filter.
          </p>
        </div>
      )}
    </div>
  );
}
