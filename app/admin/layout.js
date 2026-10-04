"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  return (
    <div className="rieti-layout">
      <Sidebar
        abierto={sidebarAbierto}
        setAbierto={setSidebarAbierto}
      />

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