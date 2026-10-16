const TAMANO_ZONA_KM = 3;

const COLORES = {
  baja: "#38bdf8",
  media: "#facc15",
  alta: "#dc2626",
};

function obtenerCoordenadas(reporte) {
  const latitud = Number(reporte.latitud);
  const longitud = Number(reporte.longitud);

  if (
    reporte.latitud == null ||
    reporte.longitud == null ||
    String(reporte.latitud).trim() === "" ||
    String(reporte.longitud).trim() === "" ||
    !Number.isFinite(latitud) ||
    !Number.isFinite(longitud) ||
    Math.abs(latitud) > 90 ||
    Math.abs(longitud) > 180 ||
    (latitud === 0 && longitud === 0)
  ) {
    return null;
  }

  return { latitud, longitud };
}

function agruparReportes(reportes) {
  const zonas = new Map();

  const pasoLatitud = TAMANO_ZONA_KM / 111.32;
  const pasoLongitud =
    TAMANO_ZONA_KM / (111.32 * Math.cos((19.35 * Math.PI) / 180));

  for (const reporte of reportes) {
    const coordenadas = obtenerCoordenadas(reporte);

    if (!coordenadas) continue;

    const { latitud, longitud } = coordenadas;

    const fila = Math.floor(latitud / pasoLatitud);
    const columna = Math.floor(longitud / pasoLongitud);
    const clave = `${fila}-${columna}`;

    if (!zonas.has(clave)) {
      zonas.set(clave, {
        cantidad: 0,
        sumaLatitud: 0,
        sumaLongitud: 0,
      });
    }

    const zona = zonas.get(clave);

    zona.cantidad++;
    zona.sumaLatitud += latitud;
    zona.sumaLongitud += longitud;
  }

  return [...zonas.values()].map((zona) => ({
    cantidad: zona.cantidad,
    latitud: zona.sumaLatitud / zona.cantidad,
    longitud: zona.sumaLongitud / zona.cantidad,
  }));
}

function clasificarZonas(zonas) {
  const maximo = Math.max(0, ...zonas.map((zona) => zona.cantidad));

  return zonas.map((zona) => {
    const porcentaje = maximo > 0 ? zona.cantidad / maximo : 0;

    let nivel = "baja";

    if (maximo > 1 && porcentaje >= 0.67) {
      nivel = "alta";
    } else if (maximo > 1 && porcentaje >= 0.34) {
      nivel = "media";
    }

    return {
      ...zona,
      nivel,
      color: COLORES[nivel],
    };
  });
}
