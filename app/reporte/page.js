"use client";

import { useState } from "react";

export default function Reporte() {
  const [paso, setPaso] = useState(1);
  const [modalidad, setModalidad] = useState("SEGUIMIENTO");
  const [correoContacto, setCorreoContacto] = useState("");

  function siguiente() {
    setPaso(paso + 1);
  }

  return (
    <main>
      {paso === 1 && (
        <section>
          <span>01</span>
          <h1>¿Cómo deseas realizar tu reporte?</h1>
          <p>Selecciona la opción que prefieras.</p>

          <div>
            <button
              type="button"
              onClick={() => {
                setModalidad("ANONIMO");
                setCorreoContacto("");
              }}
            >
              <h2>Reporte anónimo</h2>
              <p>
                No se solicitará información de contacto ni se generará un folio
                de seguimiento.
              </p>
            </button>

            <button type="button" onClick={() => setModalidad("SEGUIMIENTO")}>
              <h2>Reporte con seguimiento</h2>

              <p>
                Proporciona un correo para recibir tu folio y consultar los
                avances del reporte.
              </p>
            </button>
          </div>

          {modalidad === "SEGUIMIENTO" && (
            <div>
              <label htmlFor="correoContacto">Correo electrónico *</label>

              <input
                id="correoContacto"
                type="email"
                value={correoContacto}
                onChange={(e) => setCorreoContacto(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          )}

          <div>
            <strong>Tu información está protegida</strong>

            <p>
              Los datos proporcionados serán utilizados únicamente para la
              atención y seguimiento del reporte.
            </p>
          </div>

          <button type="button" onClick={siguiente}>
            Continur
          </button>


        </section>
      )}
    </main>
  );
}
