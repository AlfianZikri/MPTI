import { createBrowserRouter } from "react-router";
import { MainWebsite } from "./pages/MainWebsite";
import { LoginPage } from "./pages/Login";
import { PendaftaranPage } from "./pages/Pendaftaran";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminSiswa } from "./pages/admin/Siswa";
import { AdminGuru } from "./pages/admin/Guru";
import { AdminNilai } from "./pages/admin/Nilai";
import { AdminBerita } from "./pages/admin/Berita";
import { AdminAbsensi } from "./pages/admin/Absensi";
import { AdminPendaftaran } from "./pages/admin/Pendaftaran";
import { SiswaLayout } from "./layouts/SiswaLayout";
import { SiswaDashboard } from "./pages/siswa/Dashboard";
import { SiswaNilai } from "./pages/siswa/Nilai";
import { SiswaJadwal } from "./pages/siswa/Jadwal";
import { SiswaAbsensi } from "./pages/siswa/Absensi";
import { WaliLayout } from "./layouts/WaliLayout";
import { WaliDashboard } from "./pages/wali/Dashboard";
import { WaliAnak } from "./pages/wali/Anak";
import { WaliPembayaran } from "./pages/wali/Pembayaran";
import { GuruLayout } from "./layouts/GuruLayout";
import { GuruDashboard } from "./pages/guru/Dashboard";
import { GuruMapel } from "./pages/guru/Mapel";
import { GuruSiswa } from "./pages/guru/Siswa";
import { GuruNilai } from "./pages/guru/Nilai";
import { GuruAbsensi } from "./pages/guru/Absensi";

export const router = createBrowserRouter([
  { path: "/", Component: MainWebsite },
  { path: "/login", Component: LoginPage },
  { path: "/pendaftaran", Component: PendaftaranPage },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "siswa", Component: AdminSiswa },
      { path: "guru", Component: AdminGuru },
      { path: "nilai", Component: AdminNilai },
      { path: "berita", Component: AdminBerita },
      { path: "absensi", Component: AdminAbsensi },
      { path: "pendaftaran", Component: AdminPendaftaran },
    ],
  },
  {
    path: "/siswa",
    Component: SiswaLayout,
    children: [
      { index: true, Component: SiswaDashboard },
      { path: "nilai", Component: SiswaNilai },
      { path: "jadwal", Component: SiswaJadwal },
      { path: "absensi", Component: SiswaAbsensi },
    ],
  },
  {
    path: "/wali",
    Component: WaliLayout,
    children: [
      { index: true, Component: WaliDashboard },
      { path: "anak", Component: WaliAnak },
      { path: "pembayaran", Component: WaliPembayaran },
    ],
  },
  {
    path: "/guru",
    Component: GuruLayout,
    children: [
      { index: true, Component: GuruDashboard },
      { path: "mapel", Component: GuruMapel },
      { path: "siswa", Component: GuruSiswa },
      { path: "nilai", Component: GuruNilai },
      { path: "absensi", Component: GuruAbsensi },
    ],
  },
]);
