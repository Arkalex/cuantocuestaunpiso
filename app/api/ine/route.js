export async function GET() {
  try {
    const [ipvRes, salariosRes] = await Promise.all([
      fetch(
        "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/59194?tip=AM&date=20220101:20251231",
        { next: { revalidate: 86400 } },
      ),
      fetch(
        "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/28196?tip=AM",
        { next: { revalidate: 86400 } },
      ),
    ]);

    const ipvData = await ipvRes.json();
    const salariosData = await salariosRes.json();

    return Response.json({
      ipv: ipvData,
      salarios: salariosData,
    });
  } catch (error) {
    return Response.json(
      { error: "Error al conectar con el INE" },
      { status: 500 },
    );
  }
}
