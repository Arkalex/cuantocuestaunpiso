const BASE = "https://servicios.ine.es/wstempus/js/ES";

const CCAA_NAMES = {
  Andalucía: "Andalucía",
  Aragón: "Aragón",
  "Asturias, Principado de": "Asturias",
  "Balears, Illes": "Baleares",
  Canarias: "Canarias",
  Cantabria: "Cantabria",
  "Castilla y León": "Castilla y León",
  "Castilla - La Mancha": "Castilla-La Mancha",
  Cataluña: "Cataluña",
  "Comunitat Valenciana": "C. Valenciana",
  Extremadura: "Extremadura",
  Galicia: "Galicia",
  "Madrid, Comunidad de": "Madrid",
  "Murcia, Región de": "Murcia",
  "Navarra, Comunidad Foral de": "Navarra",
  "País Vasco": "País Vasco",
  "Rioja, La": "La Rioja",
  Ceuta: "Ceuta",
  Melilla: "Melilla",
};

const CCAA_LIST = Object.values(CCAA_NAMES);

function formatQuarter(dateMs) {
  const date = new Date(dateMs);
  const year = date.getFullYear().toString().slice(2);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `T${quarter} ${year}`;
}

function addNacional(chartData) {
  return chartData.map((row) => {
    const values = CCAA_LIST.map((name) => row[name]).filter((v) => v != null);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { ...row, Nacional: parseFloat(avg.toFixed(1)) };
  });
}

function rebaseToQ1_2022(chartData) {
  const base = chartData.find((d) => d.quarter === "T1 22");
  if (!base) return chartData;
  return chartData.map((row) => {
    const rebased = { quarter: row.quarter };
    for (const [key, value] of Object.entries(row)) {
      if (key === "quarter") continue;
      const baseValue = base[key];
      rebased[key] = baseValue
        ? parseFloat(((value / baseValue) * 100).toFixed(1))
        : null;
    }
    return rebased;
  });
}

export async function GET() {
  try {
    const res = await fetch(
      `${BASE}/DATOS_TABLA/25171?tip=AM&date=20220101:20251231`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error(`INE responded with status ${res.status}`);

    const raw = await res.json();

    const series = raw.filter(
      (s) =>
        s.MetaData?.some((m) => m.Nombre === "Índice") &&
        s.MetaData?.some((m) => m.Nombre === "General"),
    );

    const byQuarter = {};

    for (const serie of series) {
      const ccaaMeta = serie.MetaData?.find((m) =>
        Object.keys(CCAA_NAMES).includes(m.Nombre),
      );
      if (!ccaaMeta) continue;
      const ccaaName = CCAA_NAMES[ccaaMeta.Nombre];
      for (const point of serie.Data ?? []) {
        if (point.Valor === null) continue;
        const quarter = formatQuarter(point.Fecha);
        if (!byQuarter[quarter]) byQuarter[quarter] = { quarter };
        byQuarter[quarter][ccaaName] = parseFloat(point.Valor.toFixed(1));
      }
    }

    const order = ["T1", "T2", "T3", "T4"];
    const sorted = Object.values(byQuarter).sort((a, b) => {
      const [qa, ya] = a.quarter.split(" ");
      const [qb, yb] = b.quarter.split(" ");
      if (ya !== yb) return parseInt(ya) - parseInt(yb);
      return order.indexOf(qa) - order.indexOf(qb);
    });

    const withNacional = addNacional(sorted);
    const chartData = rebaseToQ1_2022(withNacional);

    return Response.json({ chartData });
  } catch (error) {
    console.error("INE API error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
