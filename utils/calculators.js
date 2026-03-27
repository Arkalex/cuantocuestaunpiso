
export interface PurchaseCostInputs {
  price: number;
  isNewBuild: boolean;
  itpRate?: number; // NEW: Accept dynamic ITP from the Dashboard
  agencyFeePct?: number; 
  refurbishment?: number; 
}


/**
 * Calculates Notary fees based on Spanish scale (Real Decreto 1426/1989)
 * Moved from your existing utils.ts
 */
export function CalculateNotaryFees(purchasePrice: number): number {
  const precioFolioAutorizado = 3.02;
  const precioFolioSimple = 0.6;
  const iva = 0.21;
  
  function actoDocumentado(price: number): number {
    const escala: [number, number][] = [
      [6010.12, 90.15], [30050.6, 0.0045], [60101.21, 0.0015], 
      [150253.03, 0.001], [601012.1, 0.0005], [6010121.04, 0.0003], 
      [Infinity, 0.00015]
    ];
    let idx = escala.findIndex(e => price <= e[0]);
    if (idx <= 0) return escala[0][1];
    return (price - escala[idx-1][0]) * escala[idx][1] + actoDocumentado(escala[idx-1][0]);
  }
  
  return (actoDocumentado(purchasePrice) + (25 * (precioFolioAutorizado * 2 + precioFolioSimple * 2))) * (1 + iva);
}

export function CalculateClosingCosts({ 
  price, 
  isNewBuild, 
  itpRate = 0.06, // Defaults to Madrid if not provided
  agencyFeePct = 0, 
  refurbishment = 0 
}: PurchaseCostInputs) {
  
  // 1. Taxes
  const mainTaxRate = isNewBuild ? 0.10 : itpRate; 
  const mainTax = price * mainTaxRate;
  
  // Note: AJD also varies by region (usually 0.5% to 1.5%), 
  // but 1.5% (0.015) is a safe maximum for new builds in most of Spain.
  const iajd = isNewBuild ? price * 0.015 : 0; 
  
  // 2. Fees
  const registry = price * 0.0015;
  const notaryFees = CalculateNotaryFees(price);
  
  const lawyerFees = 0; // Decide if you want to include layer fee aprox 1200 recommended
  const accountantFees = 450; // Gestoria --> needed with mortgage
  const valuation = 400; // Tasación --> needed with mortgage
  
  // 3. Agency
  const agencyFee = price * (agencyFeePct / 100) * 1.21; // many agency cgarge a fee --> probably want to included boolean or number input.

  // 4. Totals
  const totalTaxesAndLegal = mainTax + iajd + registry + notaryFees + lawyerFees + accountantFees + valuation;
  const totalSunkCosts = totalTaxesAndLegal + agencyFee;
  const totalProjectCost = price + totalSunkCosts + refurbishment;

  return {
    breakdown: { mainTax, iajd, registry, notaryFees, lawyerFees, accountantFees, valuation, agencyFee },
    totalTaxesAndLegal,
    totalSunkCosts,
    totalProjectCost
  };
}
