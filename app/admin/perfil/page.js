"use client";

import { useEffect, useState } from "react";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);

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

  const nombre = usuario?.nombre || "—";
  const correo = usuario?.correo_institucional || "—";
  const rol = usuario?.rol || "—";
  const municipio = usuario?.municipio || "—";

  return (
    <>
      <div>
        <h2>Mi perfil</h2>
        <p>Información del funcionario</p>
      </div>

      <section>
        <div>
          <span>PERFIL</span>
          <h3>Información del funcionario</h3>
        </div>

        <div>
          <div>
            <div>
              <span>Nombre</span>
              <strong>{nombre}</strong>
            </div>

            <div>
              <span>Correo institucional</span>
              <strong>{correo}</strong>
            </div>

            <div>
              <span>Rol</span>
              <strong>{rol}</strong>
            </div>

            <div>
              <span>Municipio</span>
              <strong>{municipio}</strong>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div>
          <span>CUENTA</span>
          <h3>Información de acceso</h3>
        </div>

        <div>
          <p>
            La información mostrada corresponde a los datos registrados para el
            funcionario en el sistema RIETI.
          </p>
        </div>
      </section>
    </>
  );
}
