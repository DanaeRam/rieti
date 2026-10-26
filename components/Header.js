/**
 * Encabezado del área administrativa y menú de usuario.
 *
 * @module components/Header
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Perfil from "./Perfil";
import {
  Bell,
  ChevronDown,
  UserLock,
  UserRoundPen,
  UserRound,
  Menu,
  LogOut,
} from "lucide-react";

/**
 * Muestra el menú superior, el perfil y las opciones de sesión.
 *
 * @component
 */
export default function Header({ setSidebarAbierto }) {
  const [usuario, setUsuario] = useState(null);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seccionModal, setSeccionModal] = useState("perfil");
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
    /** Cierra el menú del perfil cuando se pulsa fuera de él. */
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

  /** Abre una sección del modal de cuenta. */
  function abrirModal(seccion) {
    setSeccionModal(seccion);
    setPerfilAbierto(false);
    setModalAbierto(true);
  }

  /** Elimina los datos de sesión y vuelve al portal público. */
  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/";
  }

  const nombre = usuario?.nombre || "Usuario";
  const rol = usuario?.rol || "—";

  return (
    <>
      <header className="rieti-header">
        <div className="rieti-header-left">
          <button
            type="button"
            className="rieti-menu-button"
            onClick={() => setSidebarAbierto((actual) => !actual)}
            aria-label="Plegar o desplegar sidebar"
            title="Plegar o desplegar menú"
          >
            <Menu size={22} />
          </button>
        </div>

        <div className="rieti-header-right">
          <button
            type="button"
            className="rieti-notification"
            aria-label="Notificaciones"
          >
            <Bell size={21} />
          </button>

          <div className="rieti-profile-wrapper" ref={perfilRef}>
            <button
              type="button"
              className="rieti-profile"
              onClick={() => setPerfilAbierto((actual) => !actual)}
              aria-expanded={perfilAbierto}
              aria-haspopup="menu"
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
                <ChevronDown size={20} />
              </span>
            </button>

            {perfilAbierto && (
              <div className="rieti-profile-menu">
                <div className="rieti-profile-menu-header">
                  <div className="rieti-profile-menu-avatar">
                    <UserRound size={23} />
                  </div>

                  <div className="rieti-profile-menu-user">
                    <strong>{nombre}</strong>
                    <small>{rol}</small>
                  </div>
                </div>

                <div className="rieti-profile-menu-divider" />

                <button
                  type="button"
                  className="rieti-profile-option"
                  onClick={() => abrirModal("perfil")}
                >
                  <span className="rieti-profile-option-icon">
                    <UserRoundPen size={20} />
                  </span>

                  <div>
                    <strong>Mi perfil</strong>
                    <small>Información del funcionario</small>
                  </div>
                </button>

                <button
                  type="button"
                  className="rieti-profile-option"
                  onClick={() => abrirModal("seguridad")}
                >
                  <span className="rieti-profile-option-icon">
                    <UserLock size={20} />
                  </span>

                  <div>
                    <strong>Seguridad</strong>
                    <small>Cambiar contraseña</small>
                  </div>
                </button>
                <div className="rieti-profile-menu-divider" />

                <button
                  type="button"
                  className="rieti-profile-logout"
                  onClick={cerrarSesion}
                >
                  <LogOut size={20} />
                  <strong>Cerrar sesión</strong>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {modalAbierto && (
        <Perfil
          key={seccionModal}
          seccionInicial={seccionModal}
          onClose={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
