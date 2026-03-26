import provincias from "@/public/data/provincias.json";
import municipios from "@/public/data/municipios.json";

export async function GET() {
  return Response.json({ provincias, municipios });
}
