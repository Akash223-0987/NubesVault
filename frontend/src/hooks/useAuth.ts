import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export const useAuth = () => {
  const navigate = useNavigate();

  const login = useCallback((token: string, user?: any) => {
    localStorage.setItem("token", token);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    navigate("/", { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

  const checkAuth = useCallback(() => {
    return !!localStorage.getItem("token");
  }, []);

  return { login, logout, isAuthenticated: checkAuth };
};
