import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react";
import RestaurantDetailTab from "./RestaurantDetailTab";

const mockAddToCart = jest.fn();
const mockOnBack = jest.fn();

const restaurantMock = {
  id: 1,
  name: "Test Restaurant",
};

const menuMock = [
  {
    id: 101,
    name: "Vegan Bowl",
    description: "Healthy and green",
    price: 10,
    discount_percent: 20,
    available_quantity: 5,
    pickup_start: "10:00",
    pickup_end: "14:00",
    dietaryCompliance: [{ restriction_name: "Vegan" }],
  },
  {
    id: 102,
    name: "Chicken Sandwich",
    description: "Non-vegan item",
    price: 12,
    discount_percent: 0,
    available_quantity: 3,
    pickup_start: "10:00",
    pickup_end: "14:00",
    dietaryCompliance: [],
  },
];

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(menuMock),
      })
    );
  });
  

describe("RestaurantDetailTab", () => {
    test("shows loading initially", async () => {
        global.fetch = jest.fn(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () => resolve({ json: () => Promise.resolve(menuMock) }),
                50
              )
            )
        );
      
        render(
          <RestaurantDetailTab
            restaurant={restaurantMock}
            token="fake-token"
            addToCart={mockAddToCart}
            onBack={mockOnBack}
            userRestrictions={[]}
          />
        );
      
        // Should show loading BEFORE fetch resolves
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      
        // Now wait until menu loads
        await waitFor(() =>
          expect(screen.getByText("Vegan Bowl")).toBeInTheDocument()
        );
      });
      

  test("loads and displays menu items", async () => {
    await act(async () => {
      render(
        <RestaurantDetailTab
          restaurant={restaurantMock}
          token="fake-token"
          addToCart={mockAddToCart}
          onBack={mockOnBack}
          userRestrictions={[]}
        />
      );
    });

    await waitFor(() =>
      expect(screen.getByText("Vegan Bowl")).toBeInTheDocument()
    );

    expect(screen.getByText("Chicken Sandwich")).toBeInTheDocument();
  });

  test("displays discounted price correctly", async () => {
    await act(async () => {
      render(
        <RestaurantDetailTab
          restaurant={restaurantMock}
          token="fake-token"
          addToCart={mockAddToCart}
          onBack={mockOnBack}
          userRestrictions={[]}
        />
      );
    });

    await waitFor(() =>
      expect(screen.getByText("$8.00")).toBeInTheDocument() // 20% off 10
    );

    expect(screen.getByText("$10")).toBeInTheDocument(); // full price crossed out
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
  });

  test("calls addToCart when Add to Cart is clicked", async () => {
    await act(async () => {
      render(
        <RestaurantDetailTab
          restaurant={restaurantMock}
          token="fake-token"
          addToCart={mockAddToCart}
          onBack={mockOnBack}
          userRestrictions={[]}
        />
      );
    });

    const addButtons = await screen.findAllByText(/add to cart/i);
    fireEvent.click(addButtons[0]);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 101 })
    );
  });

  test("filters menu based on user restrictions", async () => {
    await act(async () => {
      render(
        <RestaurantDetailTab
          restaurant={restaurantMock}
          token="fake-token"
          addToCart={mockAddToCart}
          onBack={mockOnBack}
          userRestrictions={[{ restriction_name: "Vegan" }]}
        />
      );
    });
    const label = await screen.findByText(
        /show only items matching my dietary restrictions/i
      );
      
      const checkbox = label.previousSibling; // The <input>
      
      fireEvent.click(checkbox);

    // Only Vegan Bowl should be visible
    await waitFor(() => {
      expect(screen.getByText("Vegan Bowl")).toBeInTheDocument();
    });

    expect(screen.queryByText("Chicken Sandwich")).not.toBeInTheDocument();
  });

  test("calls onBack when Back button clicked", async () => {
    render(
      <RestaurantDetailTab
        restaurant={restaurantMock}
        token="fake-token"
        addToCart={mockAddToCart}
        onBack={mockOnBack}
        userRestrictions={[]}
      />
    );
  
    // Wait for loading => menu shown
    await waitFor(() =>
      expect(screen.getByText("Vegan Bowl")).toBeInTheDocument()
    );
  
    fireEvent.click(screen.getByText(/back to map/i));
  
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
  
});
