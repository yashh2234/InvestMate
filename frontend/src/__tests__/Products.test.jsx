// src/__tests__/Products.test.jsx
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock AuthContext
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", role: "user" },
    isAuthenticated: true,
    isAdmin: false,
    loading: false,
  }),
}));

// Mock API before importing the component
jest.mock("../api/api", () => ({
  apiGetProducts: jest.fn(),
  apiGetRecommendedProducts: jest.fn(),
  apiDeleteProduct: jest.fn(() => Promise.resolve()),
}));

import Products from "../pages/Products";
import { apiGetProducts, apiGetRecommendedProducts } from "../api/api";

describe("Products Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    apiGetProducts.mockResolvedValue([
      {
        id: 1,
        name: "Bond A",
        investment_type: "bond",
        risk_level: "low",
        min_investment: 1000,
        max_investment: 5000,
        description: "Bond product",
      },
      {
        id: 2,
        name: "FD B",
        investment_type: "fd",
        risk_level: "moderate",
        min_investment: 2000,
        max_investment: 10000,
        description: "FD product",
      },
    ]);

    apiGetRecommendedProducts.mockResolvedValue([
      {
        id: 3,
        name: "ETF C",
        investment_type: "etf",
        risk_level: "high",
        annual_yield: 12,
        tenure_months: 24,
        description: "Recommended ETF",
      },
    ]);
  });

  // Helper to find product by name
  const getProduct = async (name) => await screen.findByText(new RegExp(name, "i"));

  it("renders products and recommended products", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      );
    });

    expect(await getProduct("Bond A")).toBeInTheDocument();
    expect(await getProduct("FD B")).toBeInTheDocument();
    expect(await getProduct("ETF C")).toBeInTheDocument();
    expect(screen.getByText(/AI Suggested/i)).toBeInTheDocument();
  });

  it("filters products by type", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      );
    });

    await getProduct("Bond A");

    const typeSelect = screen.getAllByRole("combobox")[0]; // first select = type
    fireEvent.change(typeSelect, { target: { value: "fd" } });

    expect(screen.queryByText(/Bond A/i)).not.toBeInTheDocument();
    expect(await getProduct("FD B")).toBeInTheDocument();
  });

  it("clears filters", async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      );
    });

    await getProduct("Bond A");

    const typeSelect = screen.getAllByRole("combobox")[0];
    fireEvent.change(typeSelect, { target: { value: "fd" } });

    expect(screen.queryByText(/Bond A/i)).not.toBeInTheDocument();

    const clearBtn = screen.getByText(/Clear Filters/i);
    fireEvent.click(clearBtn);

    expect(await getProduct("Bond A")).toBeInTheDocument();
    expect(await getProduct("FD B")).toBeInTheDocument();
  });

  it("renders no products message when API returns empty", async () => {
    apiGetProducts.mockResolvedValueOnce([]);

    await act(async () => {
      render(
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      );
    });

    expect(await screen.findByText(/No products found/i)).toBeInTheDocument();
  });
});
