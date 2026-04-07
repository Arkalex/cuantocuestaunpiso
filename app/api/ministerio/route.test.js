import { describe, it, expect } from "vitest";
import provincias from "../../../public/data/provincias.json";
import municipios from "../../../public/data/municipios.json";
import salariosData from "../../../public/data/salarios.json";

// Test the ministerio route logic directly (without Next.js HTTP layer)
function buildMinisterioResponse() {
  return {
    provincias,
    municipios,
    salarios: salariosData.salarios,
    dataQuarter: salariosData.dataQuarter,
  };
}

describe("API /api/ministerio — data shape", () => {
  it("provincias is an object with province keys", () => {
    const { provincias: p } = buildMinisterioResponse();
    expect(typeof p).toBe("object");
    expect(Object.keys(p).length).toBeGreaterThan(0);
  });

  it("each provincia has pricePerSqm and ccaa", () => {
    const { provincias: p } = buildMinisterioResponse();
    for (const [name, data] of Object.entries(p)) {
      expect(typeof data.pricePerSqm, `${name}.pricePerSqm`).toBe("number");
      expect(data.pricePerSqm, `${name}.pricePerSqm > 0`).toBeGreaterThan(0);
      expect(typeof data.ccaa, `${name}.ccaa`).toBe("string");
    }
  });

  it("municipios is an object", () => {
    const { municipios: m } = buildMinisterioResponse();
    expect(typeof m).toBe("object");
  });

  it("each municipio has pricePerSqm and provincia", () => {
    const { municipios: m } = buildMinisterioResponse();
    for (const [name, data] of Object.entries(m)) {
      expect(typeof data.pricePerSqm, `${name}.pricePerSqm`).toBe("number");
      expect(data.pricePerSqm, `${name}.pricePerSqm > 0`).toBeGreaterThan(0);
      expect(typeof data.provincia, `${name}.provincia`).toBe("string");
    }
  });

  it("salarios contains all 19 CCAA", () => {
    const { salarios } = buildMinisterioResponse();
    const expected = [
      "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias",
      "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña",
      "C. Valenciana", "Extremadura", "Galicia", "La Rioja", "Madrid",
      "Murcia", "Navarra", "País Vasco", "Ceuta", "Melilla",
    ];
    for (const ccaa of expected) {
      expect(salarios[ccaa], `salary for ${ccaa}`).toBeGreaterThan(0);
    }
  });

  it("dataQuarter matches expected format (T[1-4] YYYY)", () => {
    const { dataQuarter } = buildMinisterioResponse();
    expect(dataQuarter).toMatch(/^T[1-4] \d{4}$/);
  });

  it("all pricePerSqm values are realistic (100 – 15000 €/m²)", () => {
    const { provincias: p } = buildMinisterioResponse();
    for (const [name, data] of Object.entries(p)) {
      expect(data.pricePerSqm, `${name} min`).toBeGreaterThanOrEqual(100);
      expect(data.pricePerSqm, `${name} max`).toBeLessThanOrEqual(15000);
    }
  });

  it("all salaries are realistic (10000 – 60000 €/year)", () => {
    const { salarios } = buildMinisterioResponse();
    for (const [ccaa, salary] of Object.entries(salarios)) {
      expect(salary, `${ccaa} min`).toBeGreaterThanOrEqual(10000);
      expect(salary, `${ccaa} max`).toBeLessThanOrEqual(60000);
    }
  });
});
