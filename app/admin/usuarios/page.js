"use client";

import { useEffect, useState } from "react";

export default function Usuarios() {
  const [nombre, setNombre] = useState("");
  const [correoInstitucional, setCorreoInstitucional] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [idMunicipio, setIdMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    async function cargarMunicipios() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/municipios",
        );

        const datos = await respuesta.json();
        setMunicipios(datos);
      } catch {
        setMunicipios([]);
      }
    }

    cargarMunicipios();
  }, []);

  async function crearUsuario(event) {
    event.preventDefault();

    setMensaje("");
    setTipoMensaje("");
    setCargando(true);

    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      const datosUsuario = {
        nombre,
        correo_institucional: correoInstitucional,
        telefono,
        password,
        idRol: 2,
        idMunicipio: Number(idMunicipio),
      };

      const respuesta = await fetch(
        "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/admin/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datosUsuario),
        },
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.message ||
            datos.error ||
            JSON.stringify(datos) ||
            "No se pudo crear el usuario",
        );
      }

      setMensaje("El alimentador fue creado correctamente.");
      setTipoMensaje("success");

      setNombre("");
      setCorreoInstitucional("");
      setTelefono("");
      setPassword("");
      setIdMunicipio("");
    } catch (error) {
      console.error("Error al crear alimentador:", error);

      setMensaje(error.message || "No se pudo crear el alimentador.");

      setTipoMensaje("error");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <div className="rieti-page-title">
        <h2>Administración de usuarios</h2>
      </div>

      <section className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <span>NUEVO ALIMENTADOR</span>
            <h3>Crear alimentador</h3>
          </div>
        </div>

        <form onSubmit={crearUsuario} className="usuarios-form">
          <div className="usuario-filtro">
            <label htmlFor="nombre">Nombre</label>

            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="usuario-filtro">
            <label htmlFor="correoInstitucional">Correo institucional</label>

            <input
              id="correoInstitucional"
              type="email"
              value={correoInstitucional}
              onChange={(e) => setCorreoInstitucional(e.target.value)}
              required
            />
          </div>

          <div className="usuario-filtro">
            <label htmlFor="telefono">Teléfono</label>

            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="usuario-filtro">
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="usuario-filtro">
            <label htmlFor="idMunicipio">Municipio</label>

            <select
              id="idMunicipio"
              value={idMunicipio}
              onChange={(e) => setIdMunicipio(e.target.value)}
              required
            >
              <option value="">Seleccionar municipio</option>
              {municipios.map((municipio) => (
                <option
                  key={municipio.idMunicipio}
                  value={municipio.idMunicipio}
                >
                  {municipio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="usuarios-form-actions">
            <button
              type="submit"
              className="usuarios-button"
              disabled={cargando}
            >
              {cargando ? "Cargando..." : "Crear alimentador"}
            </button>
          </div>

          {mensaje && (
            <div className={`usuarios-mensaje ${tipoMensaje}`}>{mensaje}</div>
          )}
        </form>
      </section>

      <section className="rieti-panel">
        <div className="rieti-panel-header usuarios-list-header">
          <div>
            <span>USUARIOS</span>
            <h3>Usuarios registrados</h3>
          </div>

          <span className="reportes-count">0 usuarios</span>
        </div>

        <div className="reportes-table-container usuarios-table-container">
          <table className="reportes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Municipio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody></tbody>
          </table>
        </div>
      </section>
    </>
  );
}
