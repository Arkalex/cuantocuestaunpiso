import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MetricCard from "../components/MetricCard";

describe("MetricCard", () => {
  it("renders title and value", () => {
    render(<MetricCard title="Cuota mensual" value="800 €" />);
    expect(screen.getByText("Cuota mensual")).toBeInTheDocument();
    expect(screen.getByText("800 €")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<MetricCard title="Esfuerzo" value="8.5 años" subtitle="para 70 m²" />);
    expect(screen.getByText("para 70 m²")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = render(<MetricCard title="Precio" value="200.000 €" />);
    expect(container.querySelector("span")).toBeNull();
  });

  it("applies danger colors when status is danger", () => {
    const { container } = render(
      <MetricCard title="Cuota" value="2.000 €" subtitle="30 años" status="danger" />
    );
    const card = container.firstChild;
    expect(card.className).toMatch(/red/);
  });

  it("applies warning colors when status is warning", () => {
    const { container } = render(
      <MetricCard title="Cuota" value="1.200 €" subtitle="30 años" status="warning" />
    );
    const card = container.firstChild;
    expect(card.className).toMatch(/amber/);
  });

  it("applies ok colors when status is ok", () => {
    const { container } = render(
      <MetricCard title="Cuota" value="600 €" subtitle="30 años" status="ok" />
    );
    const card = container.firstChild;
    expect(card.className).toMatch(/green/);
  });

  it("uses neutral colors when no status provided", () => {
    const { container } = render(
      <MetricCard title="Precio" value="200.000 €" />
    );
    const card = container.firstChild;
    expect(card.className).toMatch(/gray/);
    expect(card.className).not.toMatch(/red/);
    expect(card.className).not.toMatch(/amber/);
    expect(card.className).not.toMatch(/green/);
  });
});
