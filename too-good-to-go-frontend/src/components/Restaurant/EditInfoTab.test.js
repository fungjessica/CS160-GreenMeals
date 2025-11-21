import { render, screen, fireEvent,waitFor } from "@testing-library/react";
import EditInfoTab from "./EditInfoTab";

// Mock global alert so tests don't break
global.alert = jest.fn();

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

describe("EditInfoTab", () => {
  const restaurantMock = {
    name: "Test Restaurant",
    address: "123 Main St",
    cuisine_type: "Italian",
    phone: "555-1234",
  };

  const reloadMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Renders input fields with initial restaurant data", () => {
    render(
      <EditInfoTab
        restaurant={restaurantMock}
        token="fake-token"
        reload={reloadMock}
      />
    );

    expect(screen.getByPlaceholderText(/Name/i)).toHaveValue("Test Restaurant");
    expect(screen.getByPlaceholderText(/Address/i)).toHaveValue("123 Main St");
    expect(screen.getByPlaceholderText(/Cuisine Type/i)).toHaveValue("Italian");
    expect(screen.getByPlaceholderText(/Phone/i)).toHaveValue("555-1234");
  });

  test("Updates form state when inputs change", () => {
    render(
      <EditInfoTab
        restaurant={restaurantMock}
        token="fake-token"
        reload={reloadMock}
      />
    );

    const nameInput = screen.getByPlaceholderText(/Name/i);

    fireEvent.change(nameInput, { target: { value: "Updated Name" } });

    expect(nameInput).toHaveValue("Updated Name");
  });

  test("Submits updated info and calls reload()", async () => {
    render(
      <EditInfoTab
        restaurant={restaurantMock}
        token="fake-token"
        reload={reloadMock}
      />
    );

    // Change one field
    fireEvent.change(screen.getByPlaceholderText(/Name/i), {
      target: { value: "Updated Restaurant" },
    });

    // Submit
    fireEvent.submit(screen.getByRole("button", { name: /Save Changes/i }));
    // Wait for async fetch call
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    // Wait for async code to finish
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:3001/api/owner/restaurant/update",
            expect.objectContaining({
              method: "PUT",
              headers: expect.objectContaining({
                "Content-Type": "application/json",
                Authorization: "Bearer fake-token",
              }),
              body: JSON.stringify({
                name: "Updated Restaurant",
                address: "123 Main St",
                cuisine_type: "Italian",
                phone: "555-1234",
              }),
            })
          );
    });
    // Ensure fetch was called correctly


    // Ensure success alert was shown
    expect(global.alert).toHaveBeenCalledWith(
      "Restaurant information updated successfully!"
    );

    // Ensure reload() was called
    expect(reloadMock).toHaveBeenCalled();
  });
});