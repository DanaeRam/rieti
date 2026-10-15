/**
 * Layout del área administrativa de RIETI.
 * Organiza la navegación lateral, el encabezado y el contenido de cada página.
 *
 * @module app/admin/layout
 */
"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState } from "react";

/**
 * Organiza la navegación y el contenido de las páginas administrativas.
 *
 * @param {{ children: React.ReactNode }} props - Página que se muestra dentro del layout.
 * @component
 */
export default function AdminLayout({ children }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  return (
    <div className="rieti-layout">
      <Sidebar
        abierto={sidebarAbierto}
      />

      {sidebarAbierto && (
      <button
        type="button"
        className="rieti-overlay"
        onClick={() => setSidebarAbierto(false)}
        aria-label="Cerrar menú"
      />
    )}

      <div
        className={`rieti-main ${
          sidebarAbierto ? "sidebar-abierto" : "sidebar-cerrado"
        }`}
      >
        <Header
          setSidebarAbierto={setSidebarAbierto}
        />

        <main className="rieti-content">
          {children}
        </main>
      </div>
    </div>
  );
}