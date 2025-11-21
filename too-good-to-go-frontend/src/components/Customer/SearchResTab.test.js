/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SearchResTab from "./SearchResTab";

// ---- MOCK LEAFLET & MAP COMPONENTS ----
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }) => <div>{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  useMap: () => ({ setView: jest.fn() }),
}));

jest.mock("leaflet", () => ({
  Icon: jest.fn().mockImplementation(() => ({})),
}));

// ---- MOCK BROWSER APIs ----
beforeAll(() => {
  global.fetch = jest.fn();

  global.navigator.geolocation = {
    getCurrentPosition: jest.fn((success) =>
      success({ coords: { latitude: 37.3, longitude: -121.9 } })
    ),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

// Test data
const mockResults = [
  {
    id: 1,
    name: "Vegan House",
    cuisine_type: "Vegan",
    address: "123 Green St",
    latitude: 37.33,
    longitude: -121.88,
  },
  {
    id: 2,
    name: "Pizza Place",
    cuisine_type: "Italian",
    address: "456 Dough Rd",
    latitude: 37.34,
    longitude: -121.89,
  },
];

// Mock fetch response
function mockFetchResponse(data) {
  global.fetch.mockResolvedValue({
    json: () => Promise.resolve(data),
  });
}

describe("SearchResTab Component", () => {
  // ---------------------------------------------------------
  test("renders search UI elements", () => {
    render(
      <SearchResTab token="fake-token" handleRestaurantClick={jest.fn()} />
    );

    expect(screen.getByText(/search restaurants/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/search by name or cuisine/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  // ---------------------------------------------------------
  test("calls API when searching", async () => {
    mockFetchResponse(mockResults);

    render(
      <SearchResTab token="fake-token" handleRestaurantClick={jest.fn()} />
    );

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "vegan" },
    });

    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/customer/restaurant/search?q=vegan"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  // ---------------------------------------------------------
  test("displays results in LIST view", async () => {
    mockFetchResponse(mockResults);

    render(
      <SearchResTab token="fake-token" handleRestaurantClick={jest.fn()} />
    );

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "pizza" },
    });

    fireEvent.click(screen.getByText("Search"));

    // Switch to list view
    fireEvent.click(screen.getByText(/show list/i));

    await waitFor(() =>
      expect(screen.getByText("Pizza Place")).toBeInTheDocument()
    );

    expect(screen.getByText("Vegan House")).toBeInTheDocument();
  });

  // ---------------------------------------------------------
  test("toggles between Map and List", async () => {
    mockFetchResponse(mockResults);

    render(
      <SearchResTab token="fake-token" handleRestaurantClick={jest.fn()} />
    );

    // Default = MAP
    expect(screen.getByTestId("map")).toBeInTheDocument();

    // Switch to LIST
    fireEvent.click(screen.getByText(/show list/i));

    await waitFor(() => {
      expect(screen.queryByTestId("map")).not.toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------
  test("calls handleRestaurantClick when clicking a list item", async () => {
    mockFetchResponse(mockResults);
    const clickMock = jest.fn();

    render(<SearchResTab token="fake-token" handleRestaurantClick={clickMock} />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "vegan" },
    });

    fireEvent.click(screen.getByText("Search"));

    fireEvent.click(screen.getByText(/show list/i));

    await waitFor(() => expect(screen.getByText("Vegan House")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Vegan House"));

    expect(clickMock).toHaveBeenCalledWith({
        ...mockResults[0],
        source: "database"
      });
  });

  // ---------------------------------------------------------
  test("shows loading indicator", async () => {
    // Simulate a slow fetch
    global.fetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ json: () => Promise.resolve(mockResults) }), 40)
        )
    );

    render(
      <SearchResTab token="fake-token" handleRestaurantClick={jest.fn()} />
    );

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByText("Search"));

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );
  });
});
