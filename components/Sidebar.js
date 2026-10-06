"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar({ abierto }) {
  const [esAdministrador, setEsAdministrador] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);

      if (usuario.rol === "Administrador") {
        setEsAdministrador(true);
        
      }
    }
  }, []);

  return (
    <aside className={`rieti-sidebar ${abierto ? "open" : "closed"}`}>
      <div className="rieti-sidebar-header">
        <Link href="/admin/dashboard" className="rieti-logo">
          <img src="/rieti_logo.png" alt="RIETI" />
        </Link>
      </div>

      <nav className="rieti-menu">
        <Link href="/admin/dashboard" className="rieti-menu-item">
          {abierto && <strong>Dashboard</strong>}
        </Link>

        <Link href="/admin/reportes" className="rieti-menu-item">
          {abierto && <strong>Bandeja de reportes</strong>}
        </Link>

        <Link href="/admin/estadisticas" className="rieti-menu-item">
          {abierto && <strong>Estadísticas y analítica</strong>}
        </Link>

        {esAdministrador && (
          <Link href="/admin/usuarios" className="rieti-menu-item">
            {abierto && <strong>Administración de usuarios</strong>}
          </Link>
        )}
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