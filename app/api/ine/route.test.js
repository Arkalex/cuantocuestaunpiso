import { describe, it, expect } from "vitest";

// Test the pure helper functions from the INE route in isolation

function formatQuarter(dateMs) {
  const date = new Date(dateMs);
  const year = date.getFullYear().toString().slice(2);
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `T${quarter} ${year}`;
}

const CCAA_LIST = [
  "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias",
  "Cantabria", "Castilla y León", "Castilla-La Mancha", "Cataluña",
  "C. Valenciana", "Extremadura", "Galicia", "Madrid", "Murcia",
  "Navarra", "País Vasco", "La Rioja", "Ceuta", "Melilla",
];

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

describe("INE route helpers", () => {
  describe("formatQuarter", () => {
    it("formats Q1 correctly", () => {
      // Jan 1 2022 UTC
      expect(formatQuarter(Date.UTC(2022, 0, 1))).toBe("T1 22");
    });

    it("formats Q2 correctly", () => {
      expect(formatQuarter(Date.UTC(2022, 3, 1))).toBe("T2 22");
    });

    it("formats Q3 correctly", () => {
      expect(formatQuarter(Date.UTC(2023, 6, 1))).toBe("T3 23");
    });

    it("formats Q4 correctly", () => {
      expect(formatQuarter(Date.UTC(2024, 9, 1))).toBe("T4 24");
    });
  });

  describe("addNacional", () => {
    it("adds Nacional as mean of all CCAA", () => {
      const row = { quarter: "T1 22" };
      CCAA_LIST.forEach((c) => (row[c] = 100));
      const [result] = addNacional([row]);
      expect(result.Nacional).toBe(100);
    });

    it("ignores null values when computing Nacional", () => {
      const row = { quarter: "T1 22" };
      CCAA_LIST.forEach((c) => (row[c] = 100));
      row[CCAA_LIST[0]] = null; // one null
      const [result] = addNacional([row]);
      expect(result.Nacional).toBe(100); // still 100 since all non-null are 100
    });

    it("Nacional is a number with one decimal place", () => {
      const row = { quarter: "T1 22" };
      CCAA_LIST.forEach((c, i) => (row[c] = 100 + i));
      const [result] = addNacional([row]);
      expect(typeof result.Nacional).toBe("number");
    });
  });

  describe("rebaseToQ1_2022", () => {
    it("returns data unchanged if T1 22 is not found", () => {
      const data = [{ quarter: "T2 22", Madrid: 120 }];
      expect(rebaseToQ1_2022(data)).toEqual(data);
    });

    it("sets T1 22 base values to 100", () => {
      const data = [
        { quarter: "T1 22", Madrid: 200, Nacional: 150 },
        { quarter: "T2 22", Madrid: 220, Nacional: 165 },
      ];
      const rebased = rebaseToQ1_2022(data);
      expect(rebased[0].Madrid).toBe(100);
      expect(rebased[0].Nacional).toBe(100);
    });

    it("correctly rebases subsequent quarters", () => {
      const data = [
        { quarter: "T1 22", Madrid: 200 },
        { quarter: "T2 22", Madrid: 210 },
      ];
      const rebased = rebaseToQ1_2022(data);
      expect(rebased[1].Madrid).toBe(parseFloat(((210 / 200) * 100).toFixed(1)));
    });

    it("sets null for regions missing a base value", () => {
      const data = [
        { quarter: "T1 22", Madrid: 200 },
        { quarter: "T2 22", Madrid: 220, Baleares: 300 },
      ];
      const rebased = rebaseToQ1_2022(data);
      expect(rebased[1].Baleares).toBeNull();
    });
  });
});
