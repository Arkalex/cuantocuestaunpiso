import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegionTable from "../components/RegionTable";

const REGIONS = {
  Madrid: { pricePerSqm: 3902, avgSalary: 32220 },
  Extremadura: { pricePerSqm: 930, avgSalary: 23684 },
  Baleares: { pricePerSqm: 3810, avgSalary: 27537 },
};

describe("RegionTable", () => {
  it("renders all region rows", () => {
    render(
      <RegionTable regions={REGIONS} selectedRegion="Madrid" onSelect={() => {}} type="resale" />
    );
    expect(screen.getByText("Madrid")).toBeInTheDocument();
    expect(screen.getByText("Extremadura")).toBeInTheDocument();
    expect(screen.getByText("Baleares")).toBeInTheDocument();
  });

  it("sorts rows by price ascending", () => {
    render(
      <RegionTable regions={REGIONS} selectedRegion="Madrid" onSelect={() => {}} type="resale" />
    );
    const rows = screen.getAllByRole("row").slice(1); // skip header
    const names = rows.map((r) => r.cells[0].textContent);
    expect(names[0]).toBe("Extremadura");
    expect(names[names.length - 1]).toBe("Madrid");
  });

  it("highlights selected region with blue styling", () => {
    render(
      <RegionTable regions={REGIONS} selectedRegion="Madrid" onSelect={() => {}} type="resale" />
    );
    const madridCell = screen.getByText("Madrid");
    expect(madridCell.className).toMatch(/blue/);
  });

  it("calls onSelect with the correct region when a row is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <RegionTable regions={REGIONS} selectedRegion="Madrid" onSelect={onSelect} type="resale" />
    );
    await userEvent.click(screen.getByText("Extremadura"));
    expect(onSelect).toHaveBeenCalledWith("Extremadura");
  });

  it("applies NEW_BUILD_MULTIPLIER for new housing type", () => {
    const { rerender } = render(
      <RegionTable regions={REGIONS} selectedRegion="Extremadura" onSelect={() => {}} type="resale" />
    );
    const resalePrices = screen.getAllByText(/930/);
    expect(resalePrices.length).toBeGreaterThan(0);

    rerender(
      <RegionTable regions={REGIONS} selectedRegion="Extremadura" onSelect={() => {}} type="new" />
    );
    // 930 * 1.18 = 1097.4 → rounded to 1097
    expect(screen.queryByText(/930/)).toBeNull();
    expect(screen.getByText(/1[\.,]?097/)).toBeInTheDocument();
  });

  it("renders years column with color coding", () => {
    render(
      <RegionTable regions={REGIONS} selectedRegion="Madrid" onSelect={() => {}} type="resale" />
    );
    // Madrid: 3902*70/32220 ≈ 8.5 years → amber
    const madridRow = screen.getByText("Madrid").closest("tr");
    const yearsCell = madridRow.cells[2];
    expect(yearsCell.className).toMatch(/amber|red|green/);
  });
});
