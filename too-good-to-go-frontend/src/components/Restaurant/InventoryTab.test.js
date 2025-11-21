import { render, screen, fireEvent } from "@testing-library/react";
import InventoryTab from "./InventoryTab";

// Mock AddFoodModal so we don't test its internals
jest.mock("./AddFoodModal", () => () => <div data-testid="mock-add-food-modal">Mock Modal</div>);

describe("InventoryTab", () => {
  const mockDeleteFood = jest.fn();
  const mockSetShowAddModal = jest.fn();
  const mockReload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty state when no inventory", () => {
    render(
      <InventoryTab
        inventory={[]}
        deleteFood={mockDeleteFood}
        showAddModal={false}
        setShowAddModal={mockSetShowAddModal}
        token="fake"
        reload={mockReload}
        allRestrictions={[]}
      />
    );

    expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Add your first food item!/i)).toBeInTheDocument();
  });

  test("renders inventory list when items exist", () => {
    const mockInventory = [
      {
        id: 1,
        name: "Pizza",
        description: "Cheese pizza",
        price: 10,
        discount_percent: 20,
        available_quantity: 5,
        pickup_start: "10:00",
        pickup_end: "12:00",
        dietary_tags: "vegan,gluten-free",
      },
    ];

    render(
      <InventoryTab
        inventory={mockInventory}
        deleteFood={mockDeleteFood}
        showAddModal={false}
        setShowAddModal={mockSetShowAddModal}
        token="fake"
        reload={mockReload}
        allRestrictions={[]}
      />
    );

    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText("Cheese pizza")).toBeInTheDocument();
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("10:00 - 12:00")).toBeInTheDocument();

    // dietary tags
    expect(screen.getByText(/vegan/i)).toBeInTheDocument();
    expect(screen.getByText(/gluten-free/i)).toBeInTheDocument();
  });

  test("calls deleteFood when delete button is clicked", () => {
    const mockInventory = [
      { id: 1, name: "Pizza", description: "", price: 10, discount_percent: 0, available_quantity: 2, pickup_start: "10", pickup_end: "11" },
    ];

    render(
      <InventoryTab
        inventory={mockInventory}
        deleteFood={mockDeleteFood}
        showAddModal={false}
        setShowAddModal={mockSetShowAddModal}
        token="fake"
        reload={mockReload}
        allRestrictions={[]}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: "" }); // icon button, so no text
    fireEvent.click(deleteBtn);

    expect(mockDeleteFood).toHaveBeenCalledWith(1);
  });

  test("opens modal when Add Food Item button is clicked", () => {
    render(
      <InventoryTab
        inventory={[]}
        deleteFood={mockDeleteFood}
        showAddModal={false}
        setShowAddModal={mockSetShowAddModal}
        token="fake"
        reload={mockReload}
        allRestrictions={[]}
      />
    );

    const addButton = screen.getByText(/Add Food Item/i);
    fireEvent.click(addButton);

    expect(mockSetShowAddModal).toHaveBeenCalledWith(true);
  });

  test("renders modal when showAddModal is true", () => {
    render(
      <InventoryTab
        inventory={[]}
        deleteFood={mockDeleteFood}
        showAddModal={true}
        setShowAddModal={mockSetShowAddModal}
        token="fake"
        reload={mockReload}
        allRestrictions={[]}
      />
    );

    expect(screen.getByTestId("mock-add-food-modal")).toBeInTheDocument();
  });
});
