"use client";

import Link from "next/link";


export default function Sidebar({ abierto }) {
  return (
    <aside className={`rieti-sidebar ${abierto ? "open" : "closed"}`}>
      <div className="rieti-sidebar-header">
        <Link href="/admin/dashboard" className="rieti-logo">
          <img src="/rieti_logo.png" alt="RIETI" />
        </Link>
      </div>

      <nav className="rieti-menu">
        <Link
          href="/admin/dashboard"
          className="rieti-menu-item"
        >
          {abierto && <strong>Dashboard</strong>}
        </Link>

        <Link
          href="/admin/reportes"
          className="rieti-menu-item"
        >
          {abierto && <strong>Bandeja de reportes</strong>}
        </Link>

        <Link
          href="/admin/estadisticas"
          className="rieti-menu-item"
        >
          {abierto && <strong>Estadísticas y analítica</strong>}
        </Link>

        <Link
          href="/admin/usuarios"
          className="rieti-menu-item"
        >
          {abierto && <strong>Administración de usuarios</strong>}
        </Link>
      </nav>

      {abierto && (
        <div className="rieti-sidebar-bottom">
          <span>RIETI</span>
          <small>Sistema de reportes</small>
        </div>
      )}
    </aside>
  );
}