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
import { LayoutDashboard, FileText, BarChart3, Users, LogOut } from "lucide-react";

/**
 * Muestra la navegación principal del área administrativa.
 *
 * @param {{ abierto: boolean }} props - Indica si el menú está expandido o contraído.
 * @component
 * @example
 * <Sidebar abierto={abierto} />
 */
export default function Sidebar({ abierto }) {
  const pathname = usePathname();
  const [esAdministrador, setEsAdministrador] = useState(true);

  useEffect(() => {
    /** Verifica el rol guardado para mostrar la gestión de usuarios. */
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);

      if (usuario.rol === "Administrador") {
        setEsAdministrador(true);
      }
    }
  }, []);

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }

  return (
    <aside className={`rieti-sidebar ${abierto ? "open" : ""}`}>
      <Link href="/admin/dashboard" className="rieti-logo">
        <img src="/rieti_logo.png" alt="RIETI" />
      </Link>

      <nav className="rieti-menu">
        <Link
          href="/admin/dashboard"
          className={`rieti-menu-item ${
            pathname == "/admin/dashboard" ? "active" : ""
          }`}
        >
          {abierto && (
            <>
              <span className="rieti-menu-icon">
                <LayoutDashboard size={18} />
              </span>

              <strong>Dashboard</strong>
            </>
          )}
        </Link>

        <Link
          href="/admin/reportes"
          className={`rieti-menu-item ${
            pathname == "/admin/reportes" ? "active" : ""
          }`}
        >
          {abierto && (
            <>
              <span className="rieti-menu-icon">
                <FileText size={18} />
              </span>

              <strong>Bandeja de reportes</strong>
            </>
          )}
        </Link>

        <Link
          href="/admin/estadisticas"
          className={`rieti-menu-item ${
            pathname == "/admin/estadisticas" ? "active" : ""
          }`}
        >
          {abierto && (
            <>
              <span className="rieti-menu-icon">
                <BarChart3 size={18} />
              </span>

              <strong>Estadísticas y analítica</strong>
            </>
          )}
        </Link>

        {esAdministrador && (
          <Link
            href="/admin/usuarios"
            className={`rieti-menu-item ${
              pathname == "/admin/usuarios" ? "active" : ""
            }`}
          >
            {abierto && (
              <>
                <span className="rieti-menu-icon">
                  <Users size={18} />
                </span>

                <strong>Administración de usuarios</strong>
              </>
            )}
          </Link>
        )}
      </nav>

      {abierto && (
        <div className="rieti-sidebar-bottom">
          <button
            type="button"
            className="rieti-sidebar-logout"
            onClick={cerrarSesion}
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </aside>
    
  );
}