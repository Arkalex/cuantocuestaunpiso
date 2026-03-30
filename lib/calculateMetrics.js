// Mortgage calculation constants
export const LTV_RATIO = 0.8; // 80% loan-to-value (20% down payment)
export const ANNUAL_INTEREST_RATE = 0.035; // 3.5% APR
export const LOAN_TERM_MONTHS = 360; // 30 years
export const NET_SALARY_RATIO = 0.72; // approximate net/gross salary ratio
export const SURFACE_SQM = 70; // reference flat size in m²
export const NEW_BUILD_MULTIPLIER = 1.18; // VAT + notary/registration surcharge for new builds
export const AFFORDABILITY_OK_THRESHOLD = 30; // % of net salary: accessible
export const AFFORDABILITY_WARNING_THRESHOLD = 50; // % of net salary: difficult

/**
 * Calculate affordability metrics for a given price per m², salary and housing type.
 *
 * @param {number} pricePerSqm - Price per square metre in euros
 * @param {number} salary - Gross annual salary in euros
 * @param {"resale"|"new"} type - Housing type
 * @returns {{ pricePerSqm: number, yearsOfSalary: string, monthlyPayment: number, salaryPct: number, status: "ok"|"warning"|"danger", label: string }}
 */
export function calculateMetrics(pricePerSqm, salary, type) {
  const multiplier = type === "new" ? NEW_BUILD_MULTIPLIER : 1;
  const finalPrice = Math.round(pricePerSqm * multiplier);
  const totalPrice = finalPrice * SURFACE_SQM;
  const yearsOfSalary = (totalPrice / salary).toFixed(1);
  const principal = totalPrice * LTV_RATIO;
  const monthlyRate = ANNUAL_INTEREST_RATE / 12;
  const numPayments = LOAN_TERM_MONTHS;
  const monthlyPayment = Math.round(
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1),
  );
  const netSalary = salary * NET_SALARY_RATIO;
  const salaryPct = Math.round(((monthlyPayment * 12) / netSalary) * 100);

  let status = "danger";
  let label = "Inaccesible";
  if (salaryPct <= AFFORDABILITY_OK_THRESHOLD) {
    status = "ok";
    label = "Accesible";
  } else if (salaryPct <= AFFORDABILITY_WARNING_THRESHOLD) {
    status = "warning";
    label = "Difícil acceso";
  }

  return {
    pricePerSqm: finalPrice,
    yearsOfSalary,
    monthlyPayment,
    salaryPct,
    status,
    label,
  };
}
