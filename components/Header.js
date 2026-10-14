/**
 * Encabezado principal del panel administrativo de RIETI.
 * Muestra el menú lateral, la información del usuario autenticado,
 * la disponibilidad del perfil y la opción para cerrar sesión.
 *
 * @module components/Header
 */

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  UserLock,
  UserRoundPen,
  UserRound,
} from "lucide-react";

/**
 * Muestra la navegación y la información del usuario autenticado.
 *
 * @param {{ setSidebarAbierto: React.Dispatch<React.SetStateAction<boolean>> }} props - Función que alterna el estado del menú lateral.
 * @component
 * @example
 * <Header setSidebarAbierto={setSidebarAbierto} />
 */
export default function Header({ setSidebarAbierto }) {
  const [usuario, setUsuario] = useState(null);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const perfilRef = useRef(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      try {
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        setUsuario(null);
      }
    }
  }, []);

  useEffect(() => {
    /**
     * Cierra el menú de perfil cuando se hace clic fuera de este.
     *
     * @param {MouseEvent} event - Evento del clic detectado en el documento.
     */
    function cerrarPerfil(event) {
      if (perfilRef.current && !perfilRef.current.contains(event.target)) {
        setPerfilAbierto(false);
      }
    }

    document.addEventListener("mousedown", cerrarPerfil);

    return () => {
      document.removeEventListener("mousedown", cerrarPerfil);
    };
  }, []);

  /**
   * Cierra la sesión y redirige a la página principal.
   */
  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }

  const nombre = usuario?.nombre || "Usuario";
  const rol = usuario?.rol || "—";

  return (
    <header className="rieti-header">
      <div className="rieti-header-left">
        <button
          className="rieti-menu-button"
          onClick={() => setSidebarAbierto((actual) => !actual)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>

      <div className="rieti-header-right">
        <button className="rieti-notification" aria-label="Notificaciones">
          <Bell size={22} />
        </button>

        <div className="rieti-profile-wrapper" ref={perfilRef}>
          <button
            className="rieti-profile"
            onClick={() => setPerfilAbierto((actual) => !actual)}
            aria-expanded={perfilAbierto}
            aria-label="Abrir menú de perfil"
          >
            <div className="rieti-profile-avatar">
              <UserRound size={22} />
            </div>

            <div className="rieti-profile-info">
              <strong>{nombre}</strong>
              <small>{rol}</small>
            </div>

            <span
              className={`rieti-profile-arrow ${perfilAbierto ? "open" : ""}`}
            >
              <ChevronDown size={22} />
            </span>
          </button>

          {perfilAbierto && (
            <div className="rieti-profile-menu">
              <div className="rieti-profile-menu-header">
                <div className="rieti-profile-menu-avatar">
                  <UserRound size={22} />
                </div>

                <div>
                  <strong>{nombre}</strong>
                  <small>{rol}</small>
                </div>
              </div>

              <div className="rieti-profile-menu-divider" />

              <Link
                href="/admin/perfil"
                className="rieti-profile-option"
                onClick={() => setPerfilAbierto(false)}
              >
                <span className="rieti-profile-option-icon">
                  <UserRoundPen size={22} />
                </span>

                <div>
                  <strong>Mi perfil</strong>
                  <small>Información del funcionario</small>
                </div>
              </Link>

              <Link
                href="/admin/seguridad"
                className="rieti-profile-option"
                onClick={() => setPerfilAbierto(false)}
              >
                <span className="rieti-profile-option-icon">
                  <UserLock size={22} />
                </span>

                <div>
                  <strong>Seguridad</strong>
                  <small>Cambiar contraseña</small>
                </div>
              </Link>

              <div className="rieti-profile-menu-divider" />

              <button className="rieti-profile-logout" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
