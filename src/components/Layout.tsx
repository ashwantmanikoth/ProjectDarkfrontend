import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

const Layout = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-xl font-bold">IntelliSearch</h1>
        {isAuthenticated && (
          <>
            <p><Link href="/">Home</Link></p>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
