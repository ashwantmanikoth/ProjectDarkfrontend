import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/router";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    // Replace with your authentication logic
    if (username === "admin" && password === "admin") {
      setIsAuthenticated(true);
      localStorage.setItem("auth", "true");
      router.push("/");
      return true;
    }
    return false;
  };

  const logout = async (): Promise<boolean> => {
    setIsAuthenticated(false);
    localStorage.removeItem("auth");
    await router.push("/login");
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
