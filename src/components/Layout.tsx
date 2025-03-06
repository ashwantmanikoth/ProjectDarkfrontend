import { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

const Layout = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
          <h1 className="text-xl font-bold">IntelliSearch</h1>
          {status=="authenticated" && (
            <>
              <p>
                <Link href="/">Home</Link>
              </p>
              <button
                onClick={handleLogout}
                className="bg-blue-500 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          )}
        </header>
        <main>{children}</main>
      </ThemeProvider>
    </div>
  );
};

export default Layout;
