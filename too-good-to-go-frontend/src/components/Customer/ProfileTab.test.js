import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import ProfileTab from "./ProfileTab";

describe("ProfileTab", () => {
  const userMock = {
    user: { name: "John Doe", email: "john@example.com" },
    dietaryRestrictions: [{ id: 1 }, { id: 3 }]
  };

  const restrictionsMock = [
    { id: 1, restriction_name: "Vegan", restriction_type: "diet" },
    { id: 2, restriction_name: "Vegetarian", restriction_type: "diet" },
    { id: 3, restriction_name: "Nut-Free", restriction_type: "allergy" },
    { id: 4, restriction_name: "Gluten-Free", restriction_type: "allergy" },
  ];
  const mockUpdateRestrictions = jest.fn();
  test("renders user profile info", () => {
    render(
      <ProfileTab 
        user={userMock} 
        allRestrictions={restrictionsMock} 
        updateRestrictions={jest.fn()} 
      />
    );

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
  });

  test("groups restrictions and displays them", () => {
    render(
      <ProfileTab
        user={userMock}
        allRestrictions={restrictionsMock}
        updateRestrictions={mockUpdateRestrictions}
      />
    );
  
    // Group titles
    expect(screen.getByText(/^diet$/i)).toBeInTheDocument();
    expect(screen.getByText(/^allergy$/i)).toBeInTheDocument();
  
    // Buttons
    expect(screen.getByText("Vegan")).toBeInTheDocument();
    expect(screen.getByText("Vegetarian")).toBeInTheDocument();
    expect(screen.getByText("Nut-Free")).toBeInTheDocument();
    expect(screen.getByText("Gluten-Free")).toBeInTheDocument();
  });
  

  test("clicking Save calls updateRestrictions with selected IDs", async () => {
    const mockUpdate = jest.fn();

    await act(async () => {
      render(
        <ProfileTab 
          user={userMock} 
          allRestrictions={restrictionsMock} 
          updateRestrictions={mockUpdate} 
        />
      );
    });

    // Select an additional restriction
    fireEvent.click(screen.getByText("Vegetarian")); // id=2

    // Click Save
    fireEvent.click(screen.getByText("Save"));

    expect(mockUpdate).toHaveBeenCalledWith([1, 3, 2]);
  });
});
