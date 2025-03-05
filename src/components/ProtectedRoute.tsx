import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

import { ReactNode } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
