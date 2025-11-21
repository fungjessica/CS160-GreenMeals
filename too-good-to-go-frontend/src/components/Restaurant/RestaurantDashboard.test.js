// IMPORTANT: mock fetch BEFORE importing the component
global.fetch = jest.fn((url) => {
    if (url.includes("my-restaurant")) {
      return Promise.resolve({
        json: () => Promise.resolve({ name: "Test Restaurant" }),
      });
    }
    if (url.includes("inventory")) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes("orders")) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    }
    if (url.includes("dietary-restrictions")) {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      });
    }
  
    return Promise.reject("Unknown endpoint: " + url);
  });
  
  // mock children to avoid rendering complexity
  jest.mock("./EditInfoTab", () => () => <div>Edit Info Tab</div>);
  jest.mock("./InventoryTab", () => () => <div>Inventory Tab</div>);
  jest.mock("./OrdersTab", () => () => <div>Orders Tab</div>);
  jest.mock("./ReportTab", () => () => <div>Report Tab</div>);
  
  // NOW import React Testing Library and the component
  import { render, screen, waitFor } from "@testing-library/react";
  import RestaurantDashboard from "./RestaurantDashboard";
  
  test("renders Restaurant Dashboard UI", async () => {
    const user = { user: { role: "restaurant", name: "Test Restaurant" } };
  
    render(
      <RestaurantDashboard
        user={user}
        token="fake"
        handleLogout={() => {}}
      />
    );
  
    // visible immediately
    expect(screen.getByText(/Green Meals/i)).toBeInTheDocument();
  
    // wait for name to load
    await waitFor(() =>
      expect(screen.getByText(/Welcome, Test Restaurant/i)).toBeInTheDocument()
    );
  
    expect(screen.getByText(/Edit Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Report/i)).toBeInTheDocument();
  
    // default tab content
    expect(screen.getByText(/Edit Info Tab/i)).toBeInTheDocument();
  });
  