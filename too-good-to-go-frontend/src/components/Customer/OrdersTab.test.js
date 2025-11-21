import React from "react";
import { render, screen, fireEvent, waitFor} from "@testing-library/react";
import OrdersTab from "./OrdersTab";
import { act } from "react";

// ---------------------------
// GLOBAL MOCKS
// ---------------------------

// mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve([
        {
          id: 1,
          created_at: "2024-01-01T10:00:00Z",
          restaurant_name: "GreenMeals",
          status: "pending",
          slot_start: "09:00",
          slot_end: "12:00",
          items: [
            { food_name: "Salad", quantity: 1, price: 8.5 },
          ],
          total_amount: 8.5,
        },
      ]),
  })
);

// mock alert
global.alert = jest.fn();

// mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => "{}");
  Storage.prototype.setItem = jest.fn();
  fetch.mockClear();
  alert.mockClear();
});

// ---------------------------
// TESTS
// ---------------------------

describe("OrdersTab", () => {
  const cartMock = [
    {
      id: 10,
      name: "Pasta",
      price: 10,
      discount_percent: 0,
      quantity: 1,
      restaurant_id: 5,
      restaurant_name: "Italian Spot",
      pickup_start: "09:00",
      pickup_end: "17:00",
      specificPickup: true,
    },
  ];

  const setCartMock = jest.fn();
  const token = "fake-token";

  // ---------------------------
  // 1. RENDERS UI
  // ---------------------------
  test("renders heading", async () => {
    await act(async () => {
      render(<OrdersTab cart={[]} setCart={setCartMock} token={token} />);
    });

    expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
  });

  // ---------------------------
  // 2. LOADS ORDERS ON MOUNT
  // ---------------------------
  test("fetches orders on mount", async () => {
    await act(async () => {
      render(<OrdersTab cart={[]} setCart={setCartMock} token={token} />);
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  // ---------------------------
  // 3. SHOW CART WHEN CART IS NOT EMPTY
  // ---------------------------
  test("shows cart when cart has items", async () => {
    await act(async () => {
      render(<OrdersTab cart={cartMock} setCart={setCartMock} token={token} />);
    });

    expect(screen.getByText(/Current Cart/i)).toBeInTheDocument();
    expect(screen.getByText(/Pasta/i)).toBeInTheDocument();
  });

  // ---------------------------
  // 4. PLACE ORDER BUTTON
  // ---------------------------
  test("calls checkout when clicking Place Order", async () => {
    await act(async () => {
      render(<OrdersTab cart={cartMock} setCart={setCartMock} token={token} />);
    });

    const button = screen.getByRole("button", { name: /Place Order/i });

    await act(async () => {
      fireEvent.click(button);
    });

    // 1 fetch from initial loadOrders()
    // + 1 fetch for checkout POST
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  // ---------------------------
  // 5. SHOWS PREVIOUS ORDERS
  // ---------------------------
  test("renders past orders from backend", async () => {
    await act(async () => {
      render(<OrdersTab cart={[]} setCart={setCartMock} token={token} />);
    });

    expect(await screen.findByText(/Order #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Salad/i)).toBeInTheDocument();
  });
});
