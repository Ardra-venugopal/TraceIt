
import {
  getCurrentUser,
  setCurrentUser,
} from "./storageService";

const API_URL = "http://localhost:5000/api/auth";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Login failed.",
        };
      }

      const user = data.user;

      setCurrentUser(user);
      localStorage.setItem("traceit_token", data.token);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: "Cannot connect to the server. Please try again.",
      };
    }
  },

  signup: async (name, email, studentId, password) => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          studentId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Registration failed.",
        };
      }

      const user = data.user;

      setCurrentUser(user);
      localStorage.setItem("traceit_token", data.token);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: "Cannot connect to the server. Please try again.",
      };
    }
  },

  logout: () => {
    setCurrentUser(null);
    localStorage.removeItem("traceit_token");
  },

  getCurrentUser: () => getCurrentUser(),

  isAuthenticated: () => getCurrentUser() !== null,

  isAdmin: () => {
    const user = getCurrentUser();
    return user?.role === "admin";
  },
};
