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

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/admin";
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

        <div>
          <span className="rieti-header-label">RIETI · ADMINISTRACIÓN</span>
          <h1>Panel administrativo</h1>
        </div>
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
