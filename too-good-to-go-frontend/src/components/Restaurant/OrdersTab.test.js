import { render, screen, fireEvent } from "@testing-library/react";
import OrdersTab from "./OrdersTab";

describe("OrdersTab", () => {
  const mockUpdateStatus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("displays empty state when there are no orders", () => {
    render(<OrdersTab orders={[]} updateOrderStatus={mockUpdateStatus} />);

    expect(screen.getByText(/No orders yet/i)).toBeInTheDocument();
  });

  test("renders order details correctly", () => {
    const mockOrders = [
      {
        id: 1,
        customer_name: "John Doe",
        customer_phone: "555-1234",
        slot_start: "2024-01-01T10:00:00",
        status: "pending",
        items: [
          { food_name: "Pizza", quantity: 2, price: "9.99" },
          { food_name: "Burger", quantity: 1, price: "5.50" },
        ],
        total_amount: 25.48,
      },
    ];

    render(<OrdersTab orders={mockOrders} updateOrderStatus={mockUpdateStatus} />);

    expect(screen.getByText(/Order #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer: John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone: 555-1234/i)).toBeInTheDocument();

    // Items
    expect(screen.getByText(/Pizza x2 - \$9\.99/i)).toBeInTheDocument();
    expect(screen.getByText(/Burger x1 - \$5\.50/i)).toBeInTheDocument();

    // Total
    expect(screen.getByText(/Total: \$25.48/i)).toBeInTheDocument();
  });

  test("calls updateOrderStatus when status dropdown changes", () => {
    const mockOrders = [
      {
        id: 1,
        customer_name: "John",
        customer_phone: "555",
        slot_start: "2024-01-01T10:00:00",
        status: "pending",
        items: [],
        total_amount: 10,
      },
    ];

    render(<OrdersTab orders={mockOrders} updateOrderStatus={mockUpdateStatus} />);

    const select = screen.getByDisplayValue("Pending");

    fireEvent.change(select, { target: { value: "ready" } });

    expect(mockUpdateStatus).toHaveBeenCalledWith(1, "ready");
  });

  test("renders multiple orders", () => {
    const mockOrders = [
      {
        id: 1,
        customer_name: "John",
        customer_phone: "555",
        slot_start: "2024-01-01T10:00:00",
        status: "pending",
        items: [],
        total_amount: 10,
      },
      {
        id: 2,
        customer_name: "Sarah",
        customer_phone: "777",
        slot_start: "2024-01-01T11:00:00",
        status: "confirmed",
        items: [],
        total_amount: 15,
      },
    ];

    render(<OrdersTab orders={mockOrders} updateOrderStatus={mockUpdateStatus} />);

    expect(screen.getByText(/Order #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #2/i)).toBeInTheDocument();
  });
});
