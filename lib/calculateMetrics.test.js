import { describe, it, expect } from "vitest";
import {
  calculateMetrics,
  SURFACE_SQM,
  LTV_RATIO,
  ANNUAL_INTEREST_RATE,
  LOAN_TERM_MONTHS,
  NET_SALARY_RATIO,
  NEW_BUILD_MULTIPLIER,
  AFFORDABILITY_OK_THRESHOLD,
  AFFORDABILITY_WARNING_THRESHOLD,
} from "../lib/calculateMetrics";

describe("calculateMetrics", () => {
  describe("price calculation", () => {
    it("returns the input price per m² unchanged for resale housing", () => {
      const result = calculateMetrics(2000, 30000, "resale");
      expect(result.pricePerSqm).toBe(2000);
    });

    it("applies NEW_BUILD_MULTIPLIER for new housing", () => {
      const result = calculateMetrics(2000, 30000, "new");
      expect(result.pricePerSqm).toBe(Math.round(2000 * NEW_BUILD_MULTIPLIER));
    });

    it("rounds the price per m² to a whole number", () => {
      const result = calculateMetrics(1999.9, 30000, "resale");
      expect(Number.isInteger(result.pricePerSqm)).toBe(true);
    });
  });

  describe("years of salary", () => {
    it("calculates years of salary correctly", () => {
      const pricePerSqm = 2000;
      const salary = 40000;
      const totalPrice = pricePerSqm * SURFACE_SQM;
      const expected = (totalPrice / salary).toFixed(1);
      const result = calculateMetrics(pricePerSqm, salary, "resale");
      expect(result.yearsOfSalary).toBe(expected);
    });

    it("returns a string with one decimal place", () => {
      const result = calculateMetrics(1500, 28000, "resale");
      expect(result.yearsOfSalary).toMatch(/^\d+\.\d$/);
    });
  });

  describe("monthly mortgage payment", () => {
    it("calculates a positive monthly payment", () => {
      const result = calculateMetrics(1500, 28000, "resale");
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it("monthly payment is higher for more expensive properties", () => {
      const cheap = calculateMetrics(1000, 30000, "resale");
      const expensive = calculateMetrics(3000, 30000, "resale");
      expect(expensive.monthlyPayment).toBeGreaterThan(cheap.monthlyPayment);
    });

    it("computes correct payment for known values (Madrid ~3210 €/m²)", () => {
      // totalPrice = 3210 * 70 = 224700
      // principal = 224700 * 0.8 = 179760
      // monthlyRate = 0.035 / 12
      // payment = principal * (r * (1+r)^n) / ((1+r)^n - 1)
      const pricePerSqm = 3210;
      const totalPrice = pricePerSqm * SURFACE_SQM;
      const principal = totalPrice * LTV_RATIO;
      const monthlyRate = ANNUAL_INTEREST_RATE / 12;
      const n = LOAN_TERM_MONTHS;
      const expected = Math.round(
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
          (Math.pow(1 + monthlyRate, n) - 1),
      );
      const result = calculateMetrics(pricePerSqm, 50000, "resale");
      expect(result.monthlyPayment).toBe(expected);
    });
  });

  describe("salary percentage", () => {
    it("calculates salary percentage as whole number", () => {
      const result = calculateMetrics(1500, 28000, "resale");
      expect(Number.isInteger(result.salaryPct)).toBe(true);
    });

    it("salary percentage increases as price increases", () => {
      const low = calculateMetrics(800, 30000, "resale");
      const high = calculateMetrics(4000, 30000, "resale");
      expect(high.salaryPct).toBeGreaterThan(low.salaryPct);
    });

    it("salary percentage decreases as salary increases", () => {
      const poorSalary = calculateMetrics(2000, 20000, "resale");
      const richSalary = calculateMetrics(2000, 60000, "resale");
      expect(richSalary.salaryPct).toBeLessThan(poorSalary.salaryPct);
    });
  });

  describe("affordability status", () => {
    it('returns "ok" / "Accesible" when salaryPct <= threshold', () => {
      // Use a very low price and high salary to guarantee accessible status
      const result = calculateMetrics(500, 80000, "resale");
      expect(result.salaryPct).toBeLessThanOrEqual(AFFORDABILITY_OK_THRESHOLD);
      expect(result.status).toBe("ok");
      expect(result.label).toBe("Accesible");
    });

    it('returns "warning" / "Difícil acceso" in the middle band', () => {
      // Find a combo that lands in the 31–50% band
      // We'll binary search with a fixed price and vary salary
      let found = null;
      for (let salary = 15000; salary <= 80000; salary += 1000) {
        const r = calculateMetrics(2500, salary, "resale");
        if (
          r.salaryPct > AFFORDABILITY_OK_THRESHOLD &&
          r.salaryPct <= AFFORDABILITY_WARNING_THRESHOLD
        ) {
          found = r;
          break;
        }
      }
      expect(found).not.toBeNull();
      expect(found.status).toBe("warning");
      expect(found.label).toBe("Difícil acceso");
    });

    it('returns "danger" / "Inaccesible" when salaryPct > 50', () => {
      // Very high price, very low salary
      const result = calculateMetrics(5000, 15000, "resale");
      expect(result.salaryPct).toBeGreaterThan(AFFORDABILITY_WARNING_THRESHOLD);
      expect(result.status).toBe("danger");
      expect(result.label).toBe("Inaccesible");
    });
  });

  describe("net salary calculation", () => {
    it("uses NET_SALARY_RATIO to convert gross to net", () => {
      const salary = 40000;
      const pricePerSqm = 2000;
      const totalPrice = pricePerSqm * SURFACE_SQM;
      const principal = totalPrice * LTV_RATIO;
      const monthlyRate = ANNUAL_INTEREST_RATE / 12;
      const n = LOAN_TERM_MONTHS;
      const monthlyPayment = Math.round(
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
          (Math.pow(1 + monthlyRate, n) - 1),
      );
      const netSalary = salary * NET_SALARY_RATIO;
      const expectedPct = Math.round(((monthlyPayment * 12) / netSalary) * 100);
      const result = calculateMetrics(pricePerSqm, salary, "resale");
      expect(result.salaryPct).toBe(expectedPct);
    });
  });
});
