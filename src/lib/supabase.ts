import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Guru {
  id: string;
  nama: string;
  jabatan: string;
  mapel: string;
  pendidikan: string;
  status: "PNS" | "PPPK" | "GTT";
  email: string | null;
  telepon: string | null;
  created_at: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  jk: "L" | "P";
  tempat_lahir: string | null;
  tgl_lahir: string | null;
  agama: string | null;
  alamat: string | null;
  status: "Aktif" | "Tidak Aktif";
  created_at: string;
}

export interface Berita {
  id: string;
  judul: string;
  kategori: "Prestasi" | "Kegiatan" | "Pengumuman" | "Akademik";
  excerpt: string | null;
  konten: string | null;
  img_url: string | null;
  status: "Publikasi" | "Draft";
  views: number;
  tanggal: string;
  created_at: string;
}

export interface Galeri {
  id: string;
  src_url: string;
  alt: string;
  urutan: number;
  created_at: string;
}

export interface Program {
  id: string;
  icon_name: string;
  title: string;
  deskripsi: string;
  urutan: number;
}

export interface Nilai {
  id: string;
  siswa_id: string;
  kelas: string;
  mapel: string;
  semester: string;
  tahun_ajaran: string;
  tugas: number | null;
  uh: number | null;
  uts: number | null;
  uas: number | null;
  nilai_akhir: number | null;
  predikat: string | null;
  created_at: string;
  siswa?: Siswa;
}

export interface Absensi {
  id: string;
  siswa_id: string;
  tanggal: string;
  status: "Hadir" | "Sakit" | "Izin" | "Alpa" | "Libur";
  created_at: string;
}

export interface Jadwal {
  id: string;
  kelas: string;
  hari: string;
  jam: string;
  mapel: string;
  guru_nama: string;
  urutan: number;
}

export interface SPP {
  id: string;
  siswa_id: string;
  bulan: string;
  jumlah: number;
  tgl_bayar: string | null;
  status: "Lunas" | "Belum Bayar" | "Menunggu Konfirmasi";
  metode: string | null;
  created_at: string;
}

export interface Pendaftaran {
  id?: string;
  nomor_pendaftaran?: string;
  nama_lengkap: string;
  nama_kecil?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
  agama?: string;
  alamat?: string;
  kelurahan?: string;
  nama_ayah?: string;
  nama_ibu?: string;
  pekerjaan_ayah?: string;
  pekerjaan_ibu?: string;
  no_hp_ortu?: string;
  email_ortu?: string;
  nama_wali?: string;
  no_hp_wali?: string;
  akte_check?: boolean;
  kk_check?: boolean;
  foto_check?: boolean;
  ijazah_check?: boolean;
  raport_check?: boolean;
  status?: string;
  created_at?: string;
}

export interface KontakPesan {
  nama: string;
  telepon?: string;
  email?: string;
  pesan: string;
}
