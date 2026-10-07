"use client";

import { useEffect, useState } from "react";

export default function Usuarios() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    async function cargarMunicipios() {
      try {
        const respuesta = await fetch(
          "https://csyacibpg4mwuom4vwqyem4bie0asjsc.lambda-url.us-east-1.on.aws/api/v1/municipios"
        );

        const datos = await respuesta.json();
        setMunicipios(datos);
      } catch {
        setMunicipios([]);
      }
    }

    cargarMunicipios();
  }, []);

  function crearUsuario(event) {
    event.preventDefault();
  }

  return (
    <>
      <div className="rieti-page-title">
        <h2>Administración de usuarios</h2>
      </div>

      <section className="rieti-panel">
        <div className="rieti-panel-header">
          <div>
            <span>NUEVO USUARIO</span>
            <h3>Crear funcionario</h3>
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
            <label htmlFor="correo">Correo institucional</label>

            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="usuario-filtro">
            <label htmlFor="contrasena">Contraseña</label>

            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          <div className="usuario-filtro">
            <label htmlFor="rol">Rol</label>

            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="administrador">Administrador</option>
              <option value="alimentador">Alimentador</option>
            </select>
          </div>

          <div className="usuario-filtro">
            <label htmlFor="municipio">Municipio</label>

            <select
              id="municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
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
            <button type="submit" className="usuarios-button">
              Crear usuario
            </button>
          </div>
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
                <th>Rol</th>
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
