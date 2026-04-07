import provincias from "@/public/data/provincias.json";
import municipios from "@/public/data/municipios.json";
import salariosData from "@/public/data/salarios.json";

export async function GET() {
  return Response.json({
    provincias,
    municipios,
    salarios: salariosData.salarios,
    dataQuarter: salariosData.dataQuarter,
  });
}
