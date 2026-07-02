import { Link, useLocation } from "react-router";
import { LogOut, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  title: string;
  subtitle: string;
  avatarInitials: string;
  avatarColor: string;
  items: NavItem[];
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ title, subtitle, avatarInitials, avatarColor, items, open, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 z-40 flex flex-col bg-primary transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo / identity */}
        <div className="px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent flex items-center justify-center flex-shrink-0">
                <span className="text-accent-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "11px" }}>SD</span>
              </div>
              <div>
                <p className="text-primary-foreground" style={{ fontSize: "12px", fontWeight: 600, lineHeight: 1.2 }}>SDN 1 Suro</p>
                <p style={{ fontSize: "10px", color: "#9CAEC7" }}>Portal Akademik</p>
              </div>
            </Link>
            <button className="lg:hidden text-primary-foreground/70 hover:text-primary-foreground" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: avatarColor }}
            >
              <span className="text-white" style={{ fontSize: "13px", fontWeight: 700 }}>{avatarInitials}</span>
            </div>
            <div>
              <p className="text-primary-foreground" style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1.2 }}>{title}</p>
              <p style={{ fontSize: "11px", color: "#9CAEC7" }}>{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href || (item.href !== "/admin" && item.href !== "/siswa" && item.href !== "/wali" && location.pathname.startsWith(item.href));
              const exactActive = location.pathname === item.href;
              const isActive = item.href.split("/").length === 2 ? exactActive : active;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      color: isActive ? "#ffffff" : "#9CAEC7",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)", paddingTop: "12px" }}>
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 transition-colors"
            style={{ color: "#9CAEC7", fontSize: "13px" }}
          >
            <LogOut size={15} />
            Keluar
          </Link>
        </div>
      </aside>
    </>
  );
}
