/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthScreen from "./AuthScreen";

// --- Mock fetch ---
beforeEach(() => {
  global.fetch = jest.fn();
  jest.clearAllMocks();
});

// --- Mock localStorage ---
beforeAll(() => {
  Storage.prototype.setItem = jest.fn();
});

describe("AuthScreen", () => {
  const mockSetToken = jest.fn();

  // ------------------------------------------------------------
  test("renders login form by default", () => {
    render(<AuthScreen setToken={mockSetToken} />);

    const buttons = screen.getAllByRole("button", { name: /login/i });
    expect(buttons.length).toBeGreaterThan(0);  // At least one login button exists
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  // ------------------------------------------------------------
  test("switches to register form", () => {
    render(<AuthScreen setToken={mockSetToken} />);

    fireEvent.click(screen.getByText(/register/i));

    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
  });

  // ------------------------------------------------------------
  test("successful login stores token and calls setToken", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "123abc" }),
    });

    render(<AuthScreen setToken={mockSetToken} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "mypassword" },
    });

    const submitButton = screen.getAllByRole("button", { name: /^login$/i })[1];
    fireEvent.click(submitButton);


    await waitFor(() => expect(mockSetToken).toHaveBeenCalledWith("123abc"));
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "123abc");
  });

  // ------------------------------------------------------------
  test("shows error on failed login", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid login" }),
    });

    render(<AuthScreen setToken={mockSetToken} />);

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongpass" },
    });

    const submitButton = screen.getAllByRole("button", { name: /^login$/i })[1];
    fireEvent.click(submitButton);


    await waitFor(() =>
      expect(screen.getByText(/invalid login/i)).toBeInTheDocument()
    );
  });

  // ------------------------------------------------------------
  test("successful register request", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "newtoken" }),
    });

    render(<AuthScreen setToken={mockSetToken} />);

    // Switch to register
    fireEvent.click(screen.getByText(/register/i));

    fireEvent.change(screen.getByPlaceholderText(/full name/i), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "pass123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/phone number/i), {
      target: { value: "555-1234" },
    });

    const submitButton = screen.getAllByRole("button", { name: /^register$/i })[1];
    fireEvent.click(submitButton);


    await waitFor(() => expect(mockSetToken).toHaveBeenCalledWith("newtoken"));
  });
});
