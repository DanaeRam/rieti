
/**
 * Menú lateral del panel administrativo de RIETI.
 * Muestra las principales rutas del sistema y oculta opciones
 * según el rol del usuario autenticado.
 *
 * @module components/Sidebar
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";

/**
 * Muestra las rutas administrativas disponibles para el usuario.
 *
 * @component
 */
export default function Sidebar({ abierto }) {
  const pathname = usePathname();
  const [esAdministrador, setEsAdministrador] = useState(false);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    try {
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        setEsAdministrador(usuario.rol === "Administrador");
      }
    } catch {
      setEsAdministrador(false);
    }
  }, []);

  /** Elimina la sesión y vuelve al portal público. */
  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }

  return (
    <aside className={`rieti-sidebar ${abierto ? "open" : "closed"}`}>
      <Link href="/admin/dashboard" className="rieti-logo">
        <img src="/rieti_logo.png" alt="RIETI" />
      </Link>

      <nav className="rieti-menu">
        <Link
          href="/admin/dashboard"
          className={`rieti-menu-item ${
            pathname === "/admin/dashboard" ? "active" : ""
          }`}
          title={!abierto ? "Dashboard" : undefined}
          aria-label="Dashboard"
        >
          <span className="rieti-menu-icon">
            <LayoutDashboard size={18} />
          </span>
          {abierto && <strong>Dashboard</strong>}
        </Link>

        <Link
          href="/admin/reportes"
          className={`rieti-menu-item ${
            pathname === "/admin/reportes" ? "active" : ""
          }`}
          title={!abierto ? "Bandeja de reportes" : undefined}
          aria-label="Bandeja de reportes"
        >
          <span className="rieti-menu-icon">
            <FileText size={18} />
          </span>
          {abierto && <strong>Bandeja de reportes</strong>}
        </Link>

        <Link
          href="/admin/estadisticas"
          className={`rieti-menu-item ${
            pathname === "/admin/estadisticas" ? "active" : ""
          }`}
          title={!abierto ? "Estadísticas y analítica" : undefined}
          aria-label="Estadísticas y analítica"
        >
          <span className="rieti-menu-icon">
            <BarChart3 size={18} />
          </span>
          {abierto && <strong>Estadísticas y analítica</strong>}
        </Link>

        {esAdministrador && (
          <Link
            href="/admin/usuarios"
            className={`rieti-menu-item ${
              pathname === "/admin/usuarios" ? "active" : ""
            }`}
            title={!abierto ? "Administración de usuarios" : undefined}
            aria-label="Administración de usuarios"
          >
            <span className="rieti-menu-icon">
              <Users size={18} />
            </span>
            {abierto && <strong>Administración de usuarios</strong>}
          </Link>
        )}
      </nav>

      <div className="rieti-sidebar-bottom">
        <button
          type="button"
          className="rieti-sidebar-logout"
          onClick={cerrarSesion}
          title={!abierto ? "Cerrar sesión" : undefined}
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
          {abierto && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
