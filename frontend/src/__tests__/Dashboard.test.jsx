// src/__tests__/Dashboard.test.jsx
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

beforeAll(() => {
  global.ResizeObserver = class {
    constructor(callback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});
// Mock useAuth to force loading: false
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", role: "user" },
    isAuthenticated: true,
    isAdmin: false,
    loading: false,
  }),
}));

// Mock useNavigate to prevent navigation errors
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => jest.fn(),
  };
});

// Mock API
import * as api from "../api/api";
jest.mock("../api/api", () => ({
  apiGetPortfolio: jest.fn(),
  apiGetPortfolioInsights: jest.fn(),
  apiGetPlatformStats: jest.fn(),
  apiGetProducts: jest.fn(),
}));

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API responses
    api.apiGetPortfolio.mockResolvedValue([
      {
        id: 1,
        name: "Bond A",
        amount: 10000,
        expected_return: 500,
        maturity_date: "2026-12-31",
        risk_level: "low",
        investment_type: "bond",
      },
      {
        id: 2,
        name: "FD B",
        amount: 15000,
        expected_return: 750,
        maturity_date: "2025-11-30",
        risk_level: "moderate",
        investment_type: "fd",
      },
    ]);

    api.apiGetPortfolioInsights.mockResolvedValue({
      totalInvested: 25000,
      riskDistribution: { low: 60, moderate: 40, high: 0 },
    });

    api.apiGetPlatformStats.mockResolvedValue({
      totalUsers: 10,
      totalInvested: 100000,
      activeProducts: 5,
    });

    api.apiGetProducts.mockResolvedValue([
      { id: 1, name: "Bond A", investment_type: "bond", risk_level: "low", min_investment: 1000 },
      { id: 2, name: "FD B", investment_type: "fd", risk_level: "moderate", min_investment: 2000 },
    ]);
  });

  it("renders user dashboard correctly", async () => {
    // Render inside act to wait for async useEffect
    await act(async () => {
      render(
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      );
    });

    // Wait for Portfolio Summary
    expect(await screen.findByText(/Portfolio Summary/i)).toBeInTheDocument();

    // Total invested
    expect(screen.getByText(/₹25000/i)).toBeInTheDocument();

    // Investments rendered
    expect(screen.getByText("Bond A")).toBeInTheDocument();
    expect(screen.getByText("FD B")).toBeInTheDocument();

    // Investments count
    expect(screen.getByText(/Your Investments: 2/i)).toBeInTheDocument();
  });
});
