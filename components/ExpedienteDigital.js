"use client";

import { useState } from "react";

export default function ExpedienteDigital({ expediente, cerrar }) {
  const [pestana, setPestana] = useState("encabezado");

  if (!expediente) {
    return null;
  }

  return (
    <div className="expediente-overlay">
      <div className="expediente-ventana">

        <div className="expediente-pestanas">

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "encabezado" ? "activa" : ""
            }`}
            onClick={() => setPestana("encabezado")}
          >
            Encabezado
          </button>

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "informacion" ? "activa" : ""
            }`}
            onClick={() => setPestana("informacion")}
          >
            Información
          </button>

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "geolocalizacion" ? "activa" : ""
            }`}
            onClick={() => setPestana("geolocalizacion")}
          >
            Geolocalización
          </button>

          <button
            type="button"
            className={`expediente-pestana ${
              pestana === "evidencias" ? "activa" : ""
            }`}
            onClick={() => setPestana("evidencias")}
          >
            Evidencias
          </button>

          <button
            type="button"
            className="expediente-cerrar"
            onClick={cerrar}
          >
            ×
          </button>

        </div>

        <div className="expediente-contenido">

          {pestana === "encabezado" && (
            <section className="expediente-seccion">
              <h3>Encabezado</h3>

              <div className="expediente-datos">

                <div className="expediente-dato">
                  <span>Folio</span>
                  <strong>{expediente.folio}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Municipio asignado</span>
                  <strong>{expediente.municipio || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Alimentador asignado</span>
                  <strong>{expediente.alimentador || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Estatus</span>
                  <strong>{expediente.estatus || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Prioridad</span>
                  <strong>{expediente.prioridad || "—"}</strong>
                </div>

              </div>
            </section>
          )}

          {pestana === "informacion" && (
            <section className="expediente-seccion">
              <h3>Información</h3>

              <div className="expediente-datos">

                <div className="expediente-dato">
                  <span>Fecha</span>
                  <strong>
                    {expediente.fecha_registro || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Municipio</span>
                  <strong>
                    {expediente.municipio || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Tipo de actividad</span>
                  <strong>
                    {expediente.actividad || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>NNA aproximados</span>
                  <strong>
                    {expediente.num_menores || "—"}
                  </strong>
                </div>

                <div className="expediente-dato">
                  <span>Nivel de riesgo</span>
                  <strong>
                    {expediente.prioridad || "—"}
                  </strong>
                </div>

              </div>

              <div className="expediente-descripcion">
                <span>Descripción</span>
                <p>{expediente.descripcion || "—"}</p>
              </div>

            </section>
          )}

          {pestana === "geolocalizacion" && (
            <section className="expediente-seccion">
              <h3>Geolocalización</h3>

              <div className="expediente-datos">

                <div className="expediente-dato">
                  <span>Latitud</span>
                  <strong>{expediente.latitud || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Longitud</span>
                  <strong>{expediente.longitud || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Calle</span>
                  <strong>{expediente.calle || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>Colonia</span>
                  <strong>{expediente.colonia || "—"}</strong>
                </div>

                <div className="expediente-dato">
                  <span>CP</span>
                  <strong>{expediente.cp || "—"}</strong>
                </div>

              </div>

              <div className="expediente-descripcion">
                <span>Referencias</span>
                <p>{expediente.referencias || "—"}</p>
              </div>

            </section>
          )}

          {pestana === "evidencias" && (
            <section className="expediente-seccion">
              <h3>Evidencias</h3>

              <p>No hay evidencias disponibles.</p>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}