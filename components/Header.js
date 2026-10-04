"use client";

export default function Header({ setSidebarAbierto }) {
  return (
    <header className="rieti-header">

      <div className="rieti-header-left">
        <button
          className="rieti-menu-button"
          onClick={() => setSidebarAbierto((actual) => !actual)}
        >
          ☰
        </button>
        <div>
          <span className="rieti-header-label">
            RIETI · ADMINISTRACIÓN
          </span>
          <h1>
            Panel administrativo
          </h1>
        </div>
      </div>
      <div className="rieti-header-right">
        <button className="rieti-notification">
          🔔
        </button>
        <div className="rieti-profile">
          <div className="rieti-profile-avatar">
            —
          </div>
          <div className="rieti-profile-info">
            <strong>Usuario</strong>
            <small>Panel administrativo</small>
          </div>

          <span className="rieti-profile-arrow">
            ⌄
          </span>
        </div>
      </div>
    </header>
  );
}