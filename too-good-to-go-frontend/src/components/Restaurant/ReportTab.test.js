import { render, screen, waitFor } from "@testing-library/react";
import ReportTab from "./ReportTab";

// Mock fetch globally
global.fetch = jest.fn();

describe("ReportTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty state when report is empty", async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([]),
    });

    render(<ReportTab token="fake-token" />);

    await waitFor(() =>
      expect(screen.getByText(/No sales data available yet/i)).toBeInTheDocument()
    );
  });

  test("fetches report data with correct headers", async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { food_name: "Pizza", total_sold: 10, revenue: 100 },
        ]),
    });

    render(<ReportTab token="fake-token" />);

    await waitFor(() => expect(fetch).toHaveBeenCalled());

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/owner/restaurant/report",
      expect.objectContaining({
        headers: { Authorization: "Bearer fake-token" },
      })
    );
  });

  test("renders table rows when report data exists", async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { food_name: "Pizza", total_sold: 10, revenue: 100 },
          { food_name: "Burger", total_sold: 5, revenue: 50 },
        ]),
    });

    render(<ReportTab token="fake-token" />);

    // Wait for rows
    await waitFor(() => {
      expect(screen.getByText("Pizza")).toBeInTheDocument();
      expect(screen.getByText("Burger")).toBeInTheDocument();
    });

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  test("calculates total revenue correctly", async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { revenue: 100 },
          { revenue: 50.25 },
          { revenue: 4.75 },
        ]),
    });

    render(<ReportTab token="fake-token" />);

    await waitFor(() =>
      expect(screen.getByText("$155.00")).toBeInTheDocument() // 100 + 50.25 + 4.75
    );
  });

  test("normalizes non-array data structures (data.report)", async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          report: [{ food_name: "Salad", total_sold: 3, revenue: 30 }],
        }),
    });

    render(<ReportTab token="fake-token" />);

    await waitFor(() =>
      expect(screen.getByText("Salad")).toBeInTheDocument()
    );
  });

  test("normalizes non-array data structures (data.rows)", async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          rows: [{ food_name: "Sushi", total_sold: 8, revenue: 80 }],
        }),
    });

    render(<ReportTab token="fake-token" />);

    await waitFor(() =>
      expect(screen.getByText("Sushi")).toBeInTheDocument()
    );
  });

  test("normalizes non-array data structures (data.data)", async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          data: [{ food_name: "Taco", total_sold: 12, revenue: 60 }],
        }),
    });

    render(<ReportTab token="fake-token" />);

    await waitFor(() =>
      expect(screen.getByText("Taco")).toBeInTheDocument()
    );
  });
});
